import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MealRecord } from '../../types/domain';

interface MealRecordCardProps {
    record: MealRecord;
    onPress: (id: string) => void;
}

export function MealRecordCard({ record, onPress }: MealRecordCardProps) {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(record.id)}
            activeOpacity={0.7}
        >
            <View style={styles.leftSection}>
                <Text style={styles.timingIcon}>🍽️</Text>
            </View>

            <View style={styles.mainSection}>
                <View style={styles.header}>
                    {record.time && (
                        <Text style={styles.timeText}>{record.time}</Text>
                    )}
                </View>

                {record.note && (
                    <Text style={styles.note} numberOfLines={1}>
                        {record.note}
                    </Text>
                )}
            </View>

            <View style={styles.rightSection}>
                {record.allergyReactionMemo && (
                    <Text style={styles.allergyBadge}>⚠️</Text>
                )}
                {record.photoIds.length > 0 && (
                    <Text style={styles.photoBadge}>📷{record.photoIds.length}</Text>
                )}
                <Text style={styles.chevron}>›</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    leftSection: {
        marginRight: 12,
    },
    timingIcon: {
        fontSize: 28,
    },
    mainSection: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },
    note: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    allergyBadge: {
        fontSize: 16,
    },
    photoBadge: {
        fontSize: 12,
        color: '#999',
    },
    chevron: {
        fontSize: 22,
        color: '#CCC',
        fontWeight: '300',
    },
});
