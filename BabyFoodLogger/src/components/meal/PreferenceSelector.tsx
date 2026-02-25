import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PreferenceLevel } from '../../types/domain';
import { PREFERENCE_COLORS, PREFERENCE_ICONS, PREFERENCE_LABELS } from '../../utils/constants';

interface PreferenceSelectorProps {
    value?: PreferenceLevel;
    onChange: (value: PreferenceLevel | undefined) => void;
    compact?: boolean;
}

const LEVELS: PreferenceLevel[] = ['allergy', 'dislike', 'weak', 'normal', 'like', 'love'];

export function PreferenceSelector({ value, onChange, compact = false }: PreferenceSelectorProps) {
    return (
        <View style={[styles.container, compact && styles.compactContainer]}>
            {LEVELS.map(level => {
                const isSelected = value === level;
                return (
                    <TouchableOpacity
                        key={level}
                        style={[
                            styles.item,
                            compact && styles.compactItem,
                            isSelected && {
                                backgroundColor: PREFERENCE_COLORS[level] + '20',
                                borderColor: PREFERENCE_COLORS[level],
                            },
                        ]}
                        onPress={() => onChange(isSelected ? undefined : level)}
                        activeOpacity={0.6}
                    >
                        <Text style={[styles.icon, compact && styles.compactIcon]}>
                            {PREFERENCE_ICONS[level]}
                        </Text>
                        {!compact && (
                            <Text
                                style={[
                                    styles.label,
                                    isSelected && { color: PREFERENCE_COLORS[level], fontWeight: '700' },
                                ]}
                            >
                                {PREFERENCE_LABELS[level]}
                            </Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    compactContainer: {
        gap: 4,
    },
    item: {
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
        minWidth: 60,
    },
    compactItem: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        minWidth: 40,
    },
    icon: {
        fontSize: 20,
    },
    compactIcon: {
        fontSize: 16,
    },
    label: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
});
