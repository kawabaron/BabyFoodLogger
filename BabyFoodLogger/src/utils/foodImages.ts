import type { ImageSourcePropType } from 'react-native';

// サンプルとして4つの食材の画像を登録（残りは後で追加）
export const FOOD_IMAGES: Record<string, ImageSourcePropType> = {
    'food-rice': require('../../assets/images/foods/food-rice.png'),
    'food-bread': require('../../assets/images/foods/food-bread.png'),
    'food-udon': require('../../assets/images/foods/food-udon.png'),
    'food-somen': require('../../assets/images/foods/food-somen.png'),
    'food-pasta': require('../../assets/images/foods/food-pasta.png'),
    'food-potato': require('../../assets/images/foods/food-potato.png'),
    'food-sweetpotato': require('../../assets/images/foods/food-sweetpotato.png'),
    'food-spinach': require('../../assets/images/foods/food-spinach.png'),
    'food-komatsuna': require('../../assets/images/foods/food-komatsuna.png'),
    'food-carrot': require('../../assets/images/foods/food-carrot.png'),
    'food-banana': require('../../assets/images/foods/food-banana.png'),
    'food-tofu': require('../../assets/images/foods/food-tofu.png'),
    // 追加17品
    'food-oatmeal': require('../../assets/images/foods/food-oatmeal.png'),
    'food-kabocha': require('../../assets/images/foods/food-kabocha.png'),
    'food-broccoli': require('../../assets/images/foods/food-broccoli.png'),
    'food-tomato': require('../../assets/images/foods/food-tomato.png'),
    'food-daikon': require('../../assets/images/foods/food-daikon.png'),
    'food-cabbage': require('../../assets/images/foods/food-cabbage.png'),
    'food-onion': require('../../assets/images/foods/food-onion.png'),
    'food-corn': require('../../assets/images/foods/food-corn.png'),
    'food-greenbean': require('../../assets/images/foods/food-greenbean.png'),
    'food-pea': require('../../assets/images/foods/food-pea.png'),
    'food-asparagus': require('../../assets/images/foods/food-asparagus.png'),
    'food-apple': require('../../assets/images/foods/food-apple.png'),
    'food-strawberry': require('../../assets/images/foods/food-strawberry.png'),
    'food-peach': require('../../assets/images/foods/food-peach.png'),
    'food-pear': require('../../assets/images/foods/food-pear.png'),
    'food-orange': require('../../assets/images/foods/food-orange.png'),
    'food-grape': require('../../assets/images/foods/food-grape.png'),
};

/**
 * 食材IDに対応する画像ソースを取得する
 */
export function getFoodImageSource(foodId: string): ImageSourcePropType | null {
    return FOOD_IMAGES[foodId] || null;
}
