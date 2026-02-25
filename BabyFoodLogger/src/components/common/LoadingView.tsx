import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingViewProps {
    message?: string;
}

export function LoadingView({ message = '読み込み中...' }: LoadingViewProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#FF8C94" />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
    },
});
