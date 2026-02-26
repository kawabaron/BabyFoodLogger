import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMasterStore } from '../../stores/masterStore';
import type { FoodCategory, FoodMaster } from '../../types/domain';
import { FOOD_CATEGORY_ICONS, FOOD_CATEGORY_LABELS } from '../../utils/constants';

interface FoodMultiSelectorProps {
    selectedFoodIds: string[];
    onToggleFood: (foodId: string) => void;
}

const CATEGORIES: FoodCategory[] = [
    'grain', 'vegetable', 'fruit', 'protein', 'dairy', 'seafood', 'dish', 'seasoning', 'other',
];

export function FoodMultiSelector({
    selectedFoodIds,
    onToggleFood,
}: FoodMultiSelectorProps) {
    const foods = useMasterStore(s => s.foods);
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState<FoodCategory | 'all'>('all');

    const filteredFoods = useMemo(() => {
        let result = foods;
        if (activeCategory !== 'all') {
            result = result.filter(f => f.category === activeCategory);
        }
        if (searchText.trim()) {
            const keyword = searchText.trim().toLowerCase();
            result = result.filter(
                f =>
                    f.name.toLowerCase().includes(keyword) ||
                    (f.kana && f.kana.toLowerCase().includes(keyword))
            );
        }
        return result;
    }, [foods, activeCategory, searchText]);

    const groupedFoods = useMemo(() => {
        if (activeCategory !== 'all') return { [activeCategory]: filteredFoods };
        const groups: Record<string, FoodMaster[]> = {};
        for (const food of filteredFoods) {
            if (!groups[food.category]) groups[food.category] = [];
            groups[food.category].push(food);
        }
        return groups;
    }, [filteredFoods, activeCategory]);

    return (
        <View style={styles.container}>
            {/* ヘッダー */}
            <View style={styles.titleRow}>
                <Text style={styles.titleText}>食材・料理一覧</Text>
                <TouchableOpacity
                    style={styles.addFoodButton}
                    onPress={() => router.push('/foods/edit')}
                >
                    <Text style={styles.addFoodButtonText}>＋ 食材・料理を追加</Text>
                </TouchableOpacity>
            </View>

            {/* 検索バー */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="食材・料理を検索..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <Text style={styles.clearButton}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* カテゴリタブ */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryTabs}
                contentContainerStyle={styles.categoryTabsContent}
            >
                <TouchableOpacity
                    style={[styles.categoryTab, activeCategory === 'all' && styles.activeCategoryTab]}
                    onPress={() => setActiveCategory('all')}
                >
                    <Text style={[styles.categoryTabText, activeCategory === 'all' && styles.activeCategoryTabText]}>
                        すべて
                    </Text>
                </TouchableOpacity>
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.categoryTab, activeCategory === cat && styles.activeCategoryTab]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <Text style={[styles.categoryTabText, activeCategory === cat && styles.activeCategoryTabText]}>
                            {FOOD_CATEGORY_ICONS[cat]} {FOOD_CATEGORY_LABELS[cat]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 選択中の食材数 */}
            {selectedFoodIds.length > 0 && (
                <Text style={styles.selectedCount}>
                    {selectedFoodIds.length}件選択中
                </Text>
            )}

            {/* 食材リスト */}
            <ScrollView style={styles.foodList} contentContainerStyle={styles.foodListContent}>
                {Object.entries(groupedFoods).map(([category, categoryFoods]) => (
                    <View key={category}>
                        {activeCategory === 'all' && (
                            <Text style={styles.categoryHeader}>
                                {FOOD_CATEGORY_ICONS[category as FoodCategory]}{' '}
                                {FOOD_CATEGORY_LABELS[category as FoodCategory]}
                            </Text>
                        )}
                        <View style={styles.foodGrid}>
                            {categoryFoods.map(food => {
                                const isSelected = selectedFoodIds.includes(food.id);
                                return (
                                    <TouchableOpacity
                                        key={food.id}
                                        style={[styles.foodItem, isSelected && styles.selectedFoodItem]}
                                        onPress={() => onToggleFood(food.id)}
                                        activeOpacity={0.6}
                                    >
                                        <Text style={styles.foodItemIcon}>{food.iconKey}</Text>
                                        <Text
                                            style={[styles.foodItemName, isSelected && styles.selectedFoodItemName]}
                                            numberOfLines={1}
                                        >
                                            {food.name}
                                        </Text>
                                        {isSelected && (
                                            <Text style={styles.checkMark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
                {filteredFoods.length === 0 && (
                    <Text style={styles.noResults}>該当する食材・料理がありません</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    titleText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#333',
    },
    addFoodButton: {
        backgroundColor: '#34C759',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 18,
    },
    addFoodButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        height: 44,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        fontSize: 16,
        color: '#999',
        padding: 4,
    },
    categoryTabs: {
        maxHeight: 44,
        marginBottom: 8,
    },
    categoryTabsContent: {
        paddingHorizontal: 12,
        gap: 6,
    },
    categoryTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    activeCategoryTab: {
        backgroundColor: '#FF8C94',
    },
    categoryTabText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    activeCategoryTabText: {
        color: '#FFF',
    },
    selectedCount: {
        fontSize: 13,
        color: '#FF8C94',
        fontWeight: '700',
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    foodList: {
        flex: 1,
    },
    foodListContent: {
        paddingBottom: 20,
    },
    categoryHeader: {
        fontSize: 15,
        fontWeight: '700',
        color: '#666',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FAFAFA',
    },
    foodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        gap: 8,
        paddingVertical: 8,
    },
    foodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        gap: 6,
    },
    selectedFoodItem: {
        backgroundColor: '#FFF0F3',
        borderColor: '#FF8C94',
    },
    foodItemIcon: {
        fontSize: 22,
    },
    foodItemName: {
        fontSize: 15,
        color: '#333',
        maxWidth: 100,
        fontWeight: '500',
    },
    selectedFoodItemName: {
        color: '#FF8C94',
        fontWeight: '700',
    },
    checkMark: {
        fontSize: 16,
        color: '#FF8C94',
        fontWeight: '700',
    },
    noResults: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 40,
    },
});
