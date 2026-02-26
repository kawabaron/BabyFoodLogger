import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CalendarDaySummary } from '../../types/domain';
import { getToday } from '../../utils/date';

interface CalendarDayCellProps {
    date: string;          // YYYY-MM-DD
    day: number;
    isCurrentMonth: boolean;
    isSelected: boolean;
    summary?: CalendarDaySummary;
    onPress: (date: string) => void;
}

export function CalendarDayCell({
    date,
    day,
    isCurrentMonth,
    isSelected,
    summary,
    onPress,
}: CalendarDayCellProps) {
    const isToday = date === getToday();
    const hasMeals = summary && summary.mealCount > 0;

    return (
        <TouchableOpacity
            style={[
                styles.cell,
                isSelected && styles.selectedCell,
                isToday && !isSelected && styles.todayCell,
                !isCurrentMonth && styles.otherMonthCell,
            ]}
            onPress={() => onPress(date)}
            activeOpacity={0.6}
        >
            <Text
                style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && !isSelected && styles.todayDayText,
                    !isCurrentMonth && styles.otherMonthDayText,
                ]}
            >
                {day}
            </Text>

            {hasMeals && (
                <View style={styles.infoContainer}>
                    {/* 代表アイコン（最大3つ） */}
                    <View style={styles.iconsRow}>
                        {summary!.representativeFoodIconKeys.map((icon, i) => (
                            <Text key={i} style={styles.foodIcon}>{icon}</Text>
                        ))}
                    </View>

                    {/* フラグ表示 */}
                    <View style={styles.flagsRow}>
                        {summary!.hasFirstTriedFood && (
                            <Text style={styles.flagText}>初</Text>
                        )}
                        {summary!.hasAllergyMemo && (
                            <Text style={styles.allergyFlag}>!</Text>
                        )}
                    </View>
                </View>
            )}

            {hasMeals && (
                <Text style={[styles.mealCount, isSelected && styles.selectedMealCount]}>
                    {summary!.mealCount}件
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cell: {
        flex: 1,
        minHeight: 64,
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 2,
        margin: 1,
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
    },
    selectedCell: {
        backgroundColor: '#FF8C94',
    },
    todayCell: {
        backgroundColor: '#FFF0F3',
        borderWidth: 1,
        borderColor: '#FF8C94',
    },
    otherMonthCell: {
        backgroundColor: 'transparent',
    },
    dayText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    selectedDayText: {
        color: '#FFF',
        fontWeight: '700',
    },
    todayDayText: {
        color: '#FF8C94',
        fontWeight: '700',
    },
    otherMonthDayText: {
        color: '#CCC',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    iconsRow: {
        flexDirection: 'row',
        gap: 1,
    },
    foodIcon: {
        fontSize: 10,
    },
    flagsRow: {
        flexDirection: 'row',
        marginLeft: 2,
    },
    flagText: {
        fontSize: 8,
        color: '#FFD700',
    },
    allergyFlag: {
        fontSize: 8,
        color: '#FF3B30',
        fontWeight: '800',
    },
    mealCount: {
        fontSize: 9,
        color: '#999',
        marginTop: 1,
    },
    selectedMealCount: {
        color: '#FFE0E3',
    },
});
