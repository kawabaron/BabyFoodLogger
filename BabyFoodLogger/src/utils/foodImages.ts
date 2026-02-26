import type { ImageSourcePropType } from 'react-native';

// サンプルとして4つの食材の画像を登録（残りは後で追加）
export const FOOD_IMAGES: Record<string, ImageSourcePropType> = {
    'food-rice': require('../../assets/images/foods/food-rice.png'),
    'food-carrot': require('../../assets/images/foods/food-carrot.png'),
    'food-banana': require('../../assets/images/foods/food-banana.png'),
    'food-tofu': require('../../assets/images/foods/food-tofu.png'),
};

/**
 * 食材IDに対応する画像ソースを取得する
 */
export function getFoodImageSource(foodId: string): ImageSourcePropType | null {
    return FOOD_IMAGES[foodId] || null;
}
