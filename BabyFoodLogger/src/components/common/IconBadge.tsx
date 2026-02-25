import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface IconBadgeProps {
    icon: string;
    size?: number;
    backgroundColor?: string;
}

export function IconBadge({ icon, size = 24, backgroundColor = '#F0F0F0' }: IconBadgeProps) {
    return (
        <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
            <Text style={[styles.icon, { fontSize: size * 0.6 }]}>{icon}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        textAlign: 'center',
    },
});
