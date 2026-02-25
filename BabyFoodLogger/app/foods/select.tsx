import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FoodMultiSelector } from '../../src/components/meal/FoodMultiSelector';

export default function FoodSelectScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ selected?: string }>();
    const [selectedIds, setSelectedIds] = useState<string[]>(
        params.selected ? params.selected.split(',') : []
    );

    const handleToggle = useCallback((foodId: string) => {
        setSelectedIds(prev =>
            prev.includes(foodId)
                ? prev.filter(id => id !== foodId)
                : [...prev, foodId]
        );
    }, []);

    return (
        <View style={styles.container}>
            <FoodMultiSelector
                selectedFoodIds={selectedIds}
                onToggleFood={handleToggle}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
});
