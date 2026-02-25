import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatMonthDisplay, getCurrentMonth } from '../../utils/date';

interface CalendarHeaderProps {
    visibleMonth: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onGoToday: () => void;
}

export function CalendarHeader({
    visibleMonth,
    onPrevMonth,
    onNextMonth,
    onGoToday,
}: CalendarHeaderProps) {
    const isCurrentMonth = visibleMonth === getCurrentMonth();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPrevMonth} style={styles.navButton} activeOpacity={0.6}>
                <Text style={styles.navText}>◀</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onGoToday} style={styles.monthContainer} activeOpacity={0.7}>
                <Text style={styles.monthText}>{formatMonthDisplay(visibleMonth)}</Text>
                {!isCurrentMonth && (
                    <Text style={styles.todayHint}>📅 今月</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onNextMonth} style={styles.navButton} activeOpacity={0.6}>
                <Text style={styles.navText}>▶</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E0E0E0',
    },
    navButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        backgroundColor: '#FFF0F3',
    },
    navText: {
        fontSize: 16,
        color: '#FF8C94',
        fontWeight: '600',
    },
    monthContainer: {
        alignItems: 'center',
    },
    monthText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    todayHint: {
        fontSize: 12,
        color: '#FF8C94',
        marginTop: 2,
    },
});
