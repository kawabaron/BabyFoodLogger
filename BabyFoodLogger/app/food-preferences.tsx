import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EmptyState } from '../src/components/common/EmptyState';
import { PreferenceSelector } from '../src/components/meal/PreferenceSelector';
import { updateFoodPreferenceManually } from '../src/repositories/mealRecordRepository';
import { useMasterStore } from '../src/stores/masterStore';
import { useRecordStore } from '../src/stores/recordStore';
import type { FoodPreferenceProfile, PreferenceLevel } from '../src/types/domain';
import {
    PREFERENCE_COLORS,
    PREFERENCE_ICONS,
    PREFERENCE_LABELS,
} from '../src/utils/constants';

export default function FoodPreferencesScreen() {
    const foodPreferenceProfiles = useRecordStore(s => s.foodPreferenceProfiles);
    const loadFoodPreferences = useRecordStore(s => s.loadFoodPreferences);
    const getFoodByIdFn = useMasterStore(s => s.getFoodById);
    const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

    useEffect(() => {
        loadFoodPreferences();
    }, []);

    const handleUpdatePreference = useCallback(async (foodId: string, pref: PreferenceLevel | undefined) => {
        if (!pref) return;
        await updateFoodPreferenceManually(foodId, pref);
        await loadFoodPreferences();
        setEditingFoodId(null);
    }, []);

    const renderItem = ({ item }: { item: FoodPreferenceProfile }) => {
        const food = getFoodByIdFn(item.foodId);
        if (!food) return null;
        const isEditing = editingFoodId === item.foodId;

        return (
            <TouchableOpacity
                style={[styles.itemCard, item.isAllergyFlag && styles.allergyCard]}
                onPress={() => setEditingFoodId(isEditing ? null : item.foodId)}
                activeOpacity={0.7}
            >
                <View style={styles.itemRow}>
                    <Text style={styles.itemIcon}>{food.iconKey}</Text>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{food.name}</Text>
                        <Text style={styles.itemStats}>
                            摂取{item.totalTriedCount}回 ・ 初回{item.firstTriedDate || '—'} ・ 最終{item.lastTriedDate || '—'}
                        </Text>
                    </View>
                    <View style={styles.prefBadge}>
                        <Text style={styles.prefIcon}>
                            {PREFERENCE_ICONS[item.latestPreference]}
                        </Text>
                        <Text
                            style={[
                                styles.prefText,
                                { color: PREFERENCE_COLORS[item.latestPreference] },
                            ]}
                        >
                            {PREFERENCE_LABELS[item.latestPreference]}
                        </Text>
                    </View>
                </View>

                {isEditing && (
                    <View style={styles.editSection}>
                        <Text style={styles.editLabel}>評価を変更:</Text>
                        <PreferenceSelector
                            value={item.latestPreference}
                            onChange={(pref) => handleUpdatePreference(item.foodId, pref)}
                        />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={foodPreferenceProfiles}
                keyExtractor={item => item.foodId}
                renderItem={renderItem}
                ListEmptyComponent={
                    <EmptyState icon="📋" message="評価された食材はまだありません" subMessage="食事記録時に評価を入力すると表示されます" />
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    listContent: { paddingVertical: 8, paddingBottom: 40 },
    itemCard: {
        backgroundColor: '#FFF', marginHorizontal: 16, marginVertical: 4, padding: 14,
        borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    allergyCard: { borderLeftWidth: 3, borderLeftColor: '#FF3B30' },
    itemRow: { flexDirection: 'row', alignItems: 'center' },
    itemIcon: { fontSize: 28, marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#333' },
    itemStats: { fontSize: 11, color: '#999', marginTop: 2 },
    prefBadge: { alignItems: 'center' },
    prefIcon: { fontSize: 22 },
    prefText: { fontSize: 11, fontWeight: '600', marginTop: 1 },
    editSection: {
        marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E0E0E0',
    },
    editLabel: { fontSize: 13, color: '#666', marginBottom: 8, fontWeight: '600' },
});
