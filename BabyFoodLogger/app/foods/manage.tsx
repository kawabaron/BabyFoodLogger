import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FoodIcon } from '../../src/components/common/FoodIcon';
import { getDatabase } from '../../src/repositories/database';
import { useMasterStore } from '../../src/stores/masterStore';
import type { FoodCategory, FoodMaster } from '../../src/types/domain';
import { DEFAULT_CHILD_ID, FOOD_CATEGORY_ICONS, FOOD_CATEGORY_LABELS, PREFERENCE_COLORS, PREFERENCE_ICONS, PREFERENCE_LABELS } from '../../src/utils/constants';

type FoodStats = {
    totalTriedCount: number;
    firstTriedDate?: string;
    lastTriedDate?: string;
    latestPreference?: string;
};

const CATEGORIES: (FoodCategory | 'all')[] = [
    'all', 'grain', 'vegetable', 'fruit', 'protein', 'dairy', 'seafood', 'dish', 'seasoning', 'other',
];

export default function FoodManageScreen() {
    const router = useRouter();
    const foods = useMasterStore(s => s.foods);
    const loadMasters = useMasterStore(s => s.loadMasters);
    const [activeCategory, setActiveCategory] = useState<FoodCategory | 'all'>('all');
    const [foodStats, setFoodStats] = useState<Map<string, FoodStats>>(new Map());

    useFocusEffect(
        useCallback(() => {
            loadMasters();
            loadFoodStats();
        }, [])
    );

    const loadFoodStats = async () => {
        const db = await getDatabase();

        // 摂取回数・初回・最終日を取得
        const stats = await db.getAllAsync<{
            foodId: string;
            totalCount: number;
            firstDate: string;
            lastDate: string;
        }>(
            `SELECT mrf.foodId,
              COUNT(*) as totalCount,
              MIN(mr.date) as firstDate,
              MAX(mr.date) as lastDate
       FROM meal_record_foods mrf
       INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
       WHERE mr.deletedAt IS NULL AND mr.childId = ?
       GROUP BY mrf.foodId`,
            DEFAULT_CHILD_ID
        );

        // 好み情報
        const prefs = await db.getAllAsync<{ foodId: string; latestPreference: string }>(
            `SELECT foodId, latestPreference FROM food_preference_profiles WHERE childId = ?`,
            DEFAULT_CHILD_ID
        );
        const prefMap = new Map(prefs.map(p => [p.foodId, p.latestPreference]));

        const statsMap = new Map<string, FoodStats>();
        for (const s of stats) {
            statsMap.set(s.foodId, {
                totalTriedCount: s.totalCount,
                firstTriedDate: s.firstDate,
                lastTriedDate: s.lastDate,
                latestPreference: prefMap.get(s.foodId),
            });
        }
        setFoodStats(statsMap);
    };

    const filteredFoods = activeCategory === 'all'
        ? foods
        : foods.filter(f => f.category === activeCategory);

    const handleDelete = (food: FoodMaster) => {
        if (food.isDefault) {
            Alert.alert('削除不可', 'デフォルト食材は削除できません');
            return;
        }
        Alert.alert('削除確認', `「${food.name}」を削除しますか？`, [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: '削除', style: 'destructive',
                onPress: async () => {
                    const db = await getDatabase();
                    await db.runAsync('DELETE FROM food_masters WHERE id = ?', food.id);
                    await loadMasters();
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={item => item}
                showsHorizontalScrollIndicator={false}
                style={styles.categoryTabs}
                contentContainerStyle={styles.categoryTabsContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.categoryTab, activeCategory === item && styles.activeCategoryTab]}
                        onPress={() => setActiveCategory(item)}
                    >
                        <Text style={[styles.categoryTabText, activeCategory === item && styles.activeCategoryTabText]}>
                            {item === 'all' ? 'すべて' : `${FOOD_CATEGORY_ICONS[item]} ${FOOD_CATEGORY_LABELS[item]}`}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            <FlatList
                data={filteredFoods}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const stats = foodStats.get(item.id);
                    return (
                        <View style={styles.foodItem}>
                            {/* Text style={styles.foodIcon}>{item.iconKey}</Text> */}
                            <FoodIcon foodId={item.id} iconKey={item.iconKey} size={28} style={styles.foodIconWrapper} />
                            <View style={styles.foodInfo}>
                                <Text style={styles.foodName}>{item.name}</Text>
                                <Text style={styles.foodCategory}>
                                    {FOOD_CATEGORY_ICONS[item.category]} {FOOD_CATEGORY_LABELS[item.category]}
                                    {item.isDefault ? '' : ' ・ カスタム'}
                                </Text>
                                {stats ? (
                                    <View style={styles.statsRow}>
                                        <Text style={styles.statsText}>
                                            摂取{stats.totalTriedCount}回 ・ 初回{stats.firstTriedDate || '—'} ・ 最終{stats.lastTriedDate || '—'}
                                        </Text>
                                        {stats.latestPreference && (
                                            <Text style={[
                                                styles.prefBadge,
                                                { color: PREFERENCE_COLORS[stats.latestPreference as keyof typeof PREFERENCE_COLORS] }
                                            ]}>
                                                {PREFERENCE_ICONS[stats.latestPreference as keyof typeof PREFERENCE_ICONS]}{' '}
                                                {PREFERENCE_LABELS[stats.latestPreference as keyof typeof PREFERENCE_LABELS]}
                                            </Text>
                                        )}
                                    </View>
                                ) : null}
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => router.push({ pathname: '/foods/edit', params: { id: item.id } })}
                                >
                                    <Text style={styles.editButtonText}>✏️</Text>
                                </TouchableOpacity>
                                {!item.isDefault && (
                                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                                        <Text style={styles.deleteBtnText}>🗑️</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={<Text style={styles.emptyText}>食材がありません</Text>}
            />

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/foods/edit')} activeOpacity={0.8}>
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    categoryTabs: { maxHeight: 52, backgroundColor: '#FFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0' },
    categoryTabsContent: { paddingHorizontal: 12, gap: 6, alignItems: 'center', paddingVertical: 8 },
    categoryTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0' },
    activeCategoryTab: { backgroundColor: '#FF8C94' },
    categoryTabText: { fontSize: 13, color: '#666', fontWeight: '600' },
    activeCategoryTabText: { color: '#FFF' },
    listContent: { paddingVertical: 8, paddingBottom: 100 },
    foodItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
        marginHorizontal: 16, marginVertical: 3, padding: 14, borderRadius: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
    },
    foodIcon: { fontSize: 28, marginRight: 12 },
    foodIconWrapper: { marginRight: 12 },
    foodInfo: { flex: 1 },
    foodName: { fontSize: 16, fontWeight: '600', color: '#333' },
    foodCategory: { fontSize: 12, color: '#999', marginTop: 2 },
    statsRow: { marginTop: 4 },
    statsText: { fontSize: 11, color: '#888' },
    prefBadge: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    actions: { flexDirection: 'row', gap: 8 },
    editButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
    editButtonText: { fontSize: 16 },
    deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center' },
    deleteBtnText: { fontSize: 16 },
    emptyText: { textAlign: 'center', color: '#CCC', fontSize: 14, paddingVertical: 40 },
    fab: {
        position: 'absolute', bottom: 30, right: 24,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#FF8C94', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#FF8C94', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
    },
    fabText: { fontSize: 28, color: '#FFF', fontWeight: '600', marginTop: -2 },
});
