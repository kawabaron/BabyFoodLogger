import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CalendarDaySummary } from '../../types/domain';
import {
    getDaysInMonth,
    getFirstDayOfWeek,
    WEEKDAY_LABELS,
} from '../../utils/date';
import { CalendarDayCell } from './CalendarDayCell';

interface MonthCalendarProps {
    visibleMonth: string;
    selectedDate: string;
    summaries: Map<string, CalendarDaySummary>;
    onDateSelect: (date: string) => void;
}

export function MonthCalendar({
    visibleMonth,
    selectedDate,
    summaries,
    onDateSelect,
}: MonthCalendarProps) {
    const weeks = useMemo(() => {
        const daysInMonth = getDaysInMonth(visibleMonth);
        const firstDayOfWeek = getFirstDayOfWeek(visibleMonth);

        const cells: Array<{
            date: string;
            day: number;
            isCurrentMonth: boolean;
        }> = [];

        // 前月の日（空セル）
        for (let i = 0; i < firstDayOfWeek; i++) {
            cells.push({ date: '', day: 0, isCurrentMonth: false });
        }

        // 当月の日
        for (let d = 1; d <= daysInMonth; d++) {
            const dayStr = d.toString().padStart(2, '0');
            const date = `${visibleMonth}-${dayStr}`;
            cells.push({ date, day: d, isCurrentMonth: true });
        }

        // 週ごとに分割
        const result: typeof cells[] = [];
        for (let i = 0; i < cells.length; i += 7) {
            const week = cells.slice(i, i + 7);
            // 足りない分を埋める
            while (week.length < 7) {
                week.push({ date: '', day: 0, isCurrentMonth: false });
            }
            result.push(week);
        }

        return result;
    }, [visibleMonth]);

    return (
        <View style={styles.container}>
            {/* 曜日ヘッダー */}
            <View style={styles.weekdayHeader}>
                {WEEKDAY_LABELS.map((label, i) => (
                    <View key={i} style={styles.weekdayCell}>
                        <Text
                            style={[
                                styles.weekdayText,
                                i === 0 && styles.sundayText,
                                i === 6 && styles.saturdayText,
                            ]}
                        >
                            {label}
                        </Text>
                    </View>
                ))}
            </View>

            {/* 日付グリッド */}
            {weeks.map((week, wi) => (
                <View key={wi} style={styles.weekRow}>
                    {week.map((cell, ci) => {
                        if (!cell.date) {
                            return <View key={ci} style={styles.emptyCell} />;
                        }
                        return (
                            <CalendarDayCell
                                key={cell.date}
                                date={cell.date}
                                day={cell.day}
                                isCurrentMonth={cell.isCurrentMonth}
                                isSelected={cell.date === selectedDate}
                                summary={summaries.get(cell.date)}
                                onPress={onDateSelect}
                            />
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    weekdayHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E0E0E0',
    },
    weekdayCell: {
        flex: 1,
        alignItems: 'center',
    },
    weekdayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    sundayText: {
        color: '#FF6B6B',
    },
    saturdayText: {
        color: '#4A90D9',
    },
    weekRow: {
        flexDirection: 'row',
        marginTop: 2,
    },
    emptyCell: {
        flex: 1,
        minHeight: 64,
        margin: 1,
    },
});
