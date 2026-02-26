import BottomSheet from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayDetailBottomSheet } from '../src/components/bottomSheet/DayDetailBottomSheet';
import { CalendarHeader } from '../src/components/calendar/CalendarHeader';
import { MonthCalendar } from '../src/components/calendar/MonthCalendar';
import { useRecordStore } from '../src/stores/recordStore';
import { useUIStore } from '../src/stores/uiStore';
import {
    getCurrentMonth,
    getNextMonth,
    getPrevMonth,
    getToday
} from '../src/utils/date';

const SWIPE_THRESHOLD = 60;

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const selectedDate = useUIStore(s => s.selectedDate);
    const visibleMonth = useUIStore(s => s.visibleMonth);
    const setSelectedDate = useUIStore(s => s.setSelectedDate);
    const setVisibleMonth = useUIStore(s => s.setVisibleMonth);

    const calendarSummaries = useRecordStore(s => s.calendarSummaries);
    const loadByMonth = useRecordStore(s => s.loadByMonth);
    const getRecordsByDate = useRecordStore(s => s.getRecordsByDate);

    useEffect(() => {
        loadByMonth(visibleMonth);
    }, [visibleMonth]);

    const dayRecords = getRecordsByDate(selectedDate);

    const handlePrevMonth = useCallback(() => {
        setVisibleMonth(getPrevMonth(visibleMonth));
    }, [visibleMonth]);

    const handleNextMonth = useCallback(() => {
        setVisibleMonth(getNextMonth(visibleMonth));
    }, [visibleMonth]);

    const handleGoToday = useCallback(() => {
        setVisibleMonth(getCurrentMonth());
        setSelectedDate(getToday());
    }, []);

    const handleDateSelect = useCallback((date: string) => {
        setSelectedDate(date);
        bottomSheetRef.current?.snapToIndex(1);
    }, []);

    const handleAddRecord = useCallback(() => {
        router.push({ pathname: '/meal/edit', params: { date: selectedDate } });
    }, [selectedDate]);

    const handleEditRecord = useCallback((id: string) => {
        router.push({ pathname: '/meal/edit', params: { id, date: selectedDate } });
    }, [selectedDate]);

    // PanResponderでスワイプ検出（GestureDetectorの代わり）
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 30;
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > SWIPE_THRESHOLD) {
                    setVisibleMonth(getPrevMonth(useUIStore.getState().visibleMonth));
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    setVisibleMonth(getNextMonth(useUIStore.getState().visibleMonth));
                }
            },
        })
    ).current;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.topBar}>
                <View style={styles.menuButtons}>
                    <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/foods/manage')}>
                        <Text style={styles.menuButtonText}>🥗</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/first-foods')}>
                        <Text style={styles.menuButtonText}>初</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/stats')}>
                        <Text style={styles.menuButtonText}>📊</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/settings')}>
                        <Text style={styles.menuButtonText}>⚙️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <CalendarHeader
                visibleMonth={visibleMonth}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onGoToday={handleGoToday}
            />
            <View {...panResponder.panHandlers}>
                <MonthCalendar
                    visibleMonth={visibleMonth}
                    selectedDate={selectedDate}
                    summaries={calendarSummaries}
                    onDateSelect={handleDateSelect}
                />
            </View>

            <DayDetailBottomSheet
                selectedDate={selectedDate}
                records={dayRecords}
                onAddRecord={handleAddRecord}
                onEditRecord={handleEditRecord}
                sheetRef={bottomSheetRef}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    topBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
    menuButtons: { flexDirection: 'row', gap: 4 },
    menuButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0F3', justifyContent: 'center', alignItems: 'center' },
    menuButtonText: { fontSize: 16 },
});
