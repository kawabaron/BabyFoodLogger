import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MealRecord } from '../../types/domain';
import { formatDateDisplay } from '../../utils/date';
import { EmptyState } from '../common/EmptyState';
import { MealRecordCard } from '../meal/MealRecordCard';

interface DayDetailBottomSheetProps {
    selectedDate: string;
    records: MealRecord[];
    onAddRecord: () => void;
    onEditRecord: (id: string) => void;
    sheetRef?: React.RefObject<BottomSheet | null>;
}

export function DayDetailBottomSheet({
    selectedDate,
    records,
    onAddRecord,
    onEditRecord,
    sheetRef,
}: DayDetailBottomSheetProps) {
    const snapPoints = useMemo(() => ['12%', '45%', '90%'], []);
    const internalRef = useRef<BottomSheet>(null);
    const ref = sheetRef || internalRef;

    return (
        <BottomSheet
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            backgroundStyle={styles.sheetBackground}
            handleIndicatorStyle={styles.handleIndicator}
            enableDynamicSizing={false}
        >
            <View style={styles.header}>
                <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={onAddRecord}
                    activeOpacity={0.7}
                >
                    <Text style={styles.addButtonText}>＋ 記録追加</Text>
                </TouchableOpacity>
            </View>

            <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
                {records.length === 0 ? (
                    <EmptyState
                        icon="🍽️"
                        message="この日の記録はありません"
                        subMessage="＋ ボタンから記録を追加しましょう"
                    />
                ) : (
                    records.map(record => (
                        <MealRecordCard
                            key={record.id}
                            record={record}
                            onPress={onEditRecord}
                        />
                    ))
                )}
            </BottomSheetScrollView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: '#F8F8F8',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    handleIndicator: {
        backgroundColor: '#D0D0D0',
        width: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E0E0E0',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#FF8C94',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    scrollContent: {
        paddingBottom: 100,
        paddingTop: 8,
    },
});
