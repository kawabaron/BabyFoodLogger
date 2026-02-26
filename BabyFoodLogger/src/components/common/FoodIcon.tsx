import React from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { getFoodImageSource } from '../../utils/foodImages';

interface FoodIconProps {
    foodId: string;
    iconKey: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
}

export function FoodIcon({ foodId, iconKey, size = 24, style }: FoodIconProps) {
    const imageSource = getFoodImageSource(foodId);

    return (
        <View style={[styles.container, { width: size, height: size }, style]}>
            {imageSource ? (
                <Image
                    source={imageSource}
                    style={{ width: size, height: size }}
                    resizeMode="contain"
                />
            ) : (
                <Text style={{ fontSize: size * 0.8 }}>{iconKey}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
