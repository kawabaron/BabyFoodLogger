import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../src/components/common/EmptyState';
import { LoadingView } from '../src/components/common/LoadingView';
import { getStats, type StatsData } from '../src/services/statsService';
import type { FoodCategory, PreferenceLevel } from '../src/types/domain';
import { FOOD_CATEGORY_ICONS, FOOD_CATEGORY_LABELS, PREFERENCE_ICONS, PREFERENCE_LABELS } from '../src/utils/constants';

export default function StatsScreen() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const data = await getStats();
            setStats(data);
            setIsLoading(false);
        })();
    }, []);

    if (isLoading) return <LoadingView />;
    if (!stats) return <EmptyState icon="📊" message="統計データを読み込めませんでした" />;

    const maxRankingCount = stats.foodRanking.length > 0 ? stats.foodRanking[0].count : 1;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* 概要カード */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryNumber}>{stats.totalMealCount}</Text>
                    <Text style={styles.summaryLabel}>総記録数</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryNumber}>{stats.totalFoodTriedCount}</Text>
                    <Text style={styles.summaryLabel}>食材摂取回数</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryNumber}>{stats.firstTimeFoodCount}</Text>
                    <Text style={styles.summaryLabel}>初体験食材</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={[styles.summaryNumber, stats.allergyFoodCount > 0 && styles.allergyNumber]}>
                        {stats.allergyFoodCount}
                    </Text>
                    <Text style={styles.summaryLabel}>アレルギー食材</Text>
                </View>
            </View>

            {/* 食材ランキング */}
            <Text style={styles.sectionTitle}>🏆 食材ランキング Top10</Text>
            <View style={styles.card}>
                {stats.foodRanking.length === 0 ? (
                    <Text style={styles.emptyText}>記録がありません</Text>
                ) : (
                    stats.foodRanking.map((item, i) => (
                        <View key={item.foodId} style={styles.rankingItem}>
                            <Text style={styles.rankNumber}>{i + 1}</Text>
                            <Text style={styles.rankIcon}>{item.iconKey}</Text>
                            <Text style={styles.rankName}>{item.foodName}</Text>
                            <View style={styles.rankBarContainer}>
                                <View
                                    style={[
                                        styles.rankBar,
                                        { width: `${(item.count / maxRankingCount) * 100}%` },
                                    ]}
                                />
                            </View>
                            <Text style={styles.rankCount}>{item.count}回</Text>
                        </View>
                    ))
                )}
            </View>

            {/* カテゴリ別 */}
            <Text style={styles.sectionTitle}>📁 カテゴリ別摂取回数</Text>
            <View style={styles.card}>
                {stats.categoryDistribution.length === 0 ? (
                    <Text style={styles.emptyText}>記録がありません</Text>
                ) : (
                    stats.categoryDistribution.map(item => (
                        <View key={item.category} style={styles.categoryItem}>
                            <Text style={styles.categoryIcon}>
                                {FOOD_CATEGORY_ICONS[item.category as FoodCategory] || '📦'}
                            </Text>
                            <Text style={styles.categoryName}>
                                {FOOD_CATEGORY_LABELS[item.category as FoodCategory] || item.category}
                            </Text>
                            <Text style={styles.categoryCount}>{item.count}回</Text>
                        </View>
                    ))
                )}
            </View>

            {/* 好き嫌い分布 */}
            <Text style={styles.sectionTitle}>😋 好き嫌いの分布</Text>
            <View style={styles.card}>
                {stats.preferenceDistribution.length === 0 ? (
                    <Text style={styles.emptyText}>評価がありません</Text>
                ) : (
                    stats.preferenceDistribution.map(item => (
                        <View key={item.preference} style={styles.categoryItem}>
                            <Text style={styles.categoryIcon}>
                                {PREFERENCE_ICONS[item.preference as PreferenceLevel] || '❓'}
                            </Text>
                            <Text style={styles.categoryName}>
                                {PREFERENCE_LABELS[item.preference as PreferenceLevel] || item.preference}
                            </Text>
                            <Text style={styles.categoryCount}>{item.count}件</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    content: { padding: 16, paddingBottom: 40 },
    summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    summaryCard: {
        flex: 1, minWidth: '45%', backgroundColor: '#FFF', borderRadius: 14, padding: 16,
        alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    summaryNumber: { fontSize: 28, fontWeight: '800', color: '#FF8C94' },
    allergyNumber: { color: '#FF3B30' },
    summaryLabel: { fontSize: 12, color: '#999', marginTop: 4, fontWeight: '600' },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 10, marginTop: 8 },
    card: {
        backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    emptyText: { fontSize: 14, color: '#CCC', textAlign: 'center', paddingVertical: 20 },
    rankingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
    rankNumber: { width: 22, fontSize: 14, fontWeight: '700', color: '#FF8C94', textAlign: 'center' },
    rankIcon: { fontSize: 20 },
    rankName: { width: 70, fontSize: 13, color: '#333' },
    rankBarContainer: {
        flex: 1, height: 12, backgroundColor: '#F5F5F5', borderRadius: 6, overflow: 'hidden',
    },
    rankBar: { height: '100%', backgroundColor: '#FFB5BB', borderRadius: 6 },
    rankCount: { width: 40, fontSize: 13, color: '#666', textAlign: 'right' },
    categoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
    categoryIcon: { fontSize: 20, width: 30 },
    categoryName: { flex: 1, fontSize: 14, color: '#333' },
    categoryCount: { fontSize: 14, color: '#666', fontWeight: '600' },
});
