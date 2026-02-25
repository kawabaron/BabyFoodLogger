import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
    icon?: string;
    message: string;
    subMessage?: string;
}

export function EmptyState({ icon = '📝', message, subMessage }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.message}>{message}</Text>
            {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    icon: {
        fontSize: 48,
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontWeight: '600',
    },
    subMessage: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
});
