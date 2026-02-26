import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EmptyState } from '../src/components/common/EmptyState';
import { FoodIcon } from '../src/components/common/FoodIcon';
import { getDatabase } from '../src/repositories/database';
import { DEFAULT_CHILD_ID, PREFERENCE_COLORS, PREFERENCE_ICONS, PREFERENCE_LABELS } from '../src/utils/constants';

type FirstFoodItem = {
    foodId: string;
    foodName: string;
    iconKey: string;
    firstDate: string;
    hasAllergyMemo: boolean;
    latestPreference?: string;
};

export default function FirstFoodsScreen() {
    const [items, setItems] = useState<FirstFoodItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'month'>('all');

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        const db = await getDatabase();
        let dateFilter = '';
        if (filter === 'month') {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            dateFilter = ` AND mr.date LIKE '${month}%'`;
        }

        // babyFoodTypeIdがnullableになったためJOINを削除し、食材のみで検索
        const rows = await db.getAllAsync<{
            foodId: string;
            foodName: string;
            iconKey: string;
            firstDate: string;
            allergyReactionMemo: string | null;
        }>(
            `SELECT mrf.foodId, fm.name as foodName, fm.iconKey,
              MIN(mr.date) as firstDate,
              mr.allergyReactionMemo
       FROM meal_record_foods mrf
       INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
       INNER JOIN food_masters fm ON mrf.foodId = fm.id
       WHERE mr.deletedAt IS NULL AND mr.childId = ?${dateFilter}
       GROUP BY mrf.foodId
       ORDER BY firstDate DESC`,
            DEFAULT_CHILD_ID
        );

        // 好み情報
        const prefs = await db.getAllAsync<{ foodId: string; latestPreference: string }>(
            `SELECT foodId, latestPreference FROM food_preference_profiles WHERE childId = ?`,
            DEFAULT_CHILD_ID
        );
        const prefMap = new Map(prefs.map(p => [p.foodId, p.latestPreference]));

        setItems(rows.map(r => ({
            ...r,
            hasAllergyMemo: !!r.allergyReactionMemo,
            latestPreference: prefMap.get(r.foodId),
        })));
    };

    return (
        <View style={styles.container}>
            {/* フィルタ */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterChip, filter === 'all' && styles.activeFilter]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>全期間</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterChip, filter === 'month' && styles.activeFilter]}
                    onPress={() => setFilter('month')}
                >
                    <Text style={[styles.filterText, filter === 'month' && styles.activeFilterText]}>今月</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                keyExtractor={item => item.foodId}
                renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                        <FoodIcon foodId={item.foodId} iconKey={item.iconKey} size={32} style={styles.itemIconWrapper} />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.foodName}</Text>
                            <Text style={styles.itemDate}>{item.firstDate}</Text>
                            {item.latestPreference && (
                                <Text style={[
                                    styles.prefBadge,
                                    { color: PREFERENCE_COLORS[item.latestPreference as keyof typeof PREFERENCE_COLORS] },
                                ]}>
                                    {PREFERENCE_ICONS[item.latestPreference as keyof typeof PREFERENCE_ICONS]}{' '}
                                    {PREFERENCE_LABELS[item.latestPreference as keyof typeof PREFERENCE_LABELS]}
                                </Text>
                            )}
                        </View>
                        {item.hasAllergyMemo && <Text style={styles.allergyBadge}>⚠️</Text>}
                    </View>
                )}
                ListEmptyComponent={
                    <EmptyState icon="🌟" message="初めての食材はまだありません" />
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    filterRow: {
        flexDirection: 'row', gap: 8, padding: 16,
    },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    activeFilter: { backgroundColor: '#FF8C94' },
    filterText: { fontSize: 14, color: '#666', fontWeight: '600' },
    activeFilterText: { color: '#FFF' },
    listContent: { paddingBottom: 40 },
    itemCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
        marginHorizontal: 16, marginVertical: 4, padding: 14, borderRadius: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    itemIconWrapper: { marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#333' },
    itemDate: { fontSize: 12, color: '#999', marginTop: 2 },
    prefBadge: { fontSize: 12, marginTop: 4, fontWeight: '600' },
    allergyBadge: { fontSize: 20 },
});
