import type { FoodMaster } from '../types/domain';

/** デフォルト食材マスタ（離乳食でよく使われる日本の食材） */
export const defaultFoods: Omit<FoodMaster, 'createdAt' | 'updatedAt'>[] = [
    // === 穀物 ===
    { id: 'food-rice', name: '米（おかゆ）', kana: 'こめ', category: 'grain', iconKey: '🍚', isDefault: true },
    { id: 'food-bread', name: 'パン', kana: 'ぱん', category: 'grain', iconKey: '🍞', isDefault: true },
    { id: 'food-udon', name: 'うどん', kana: 'うどん', category: 'grain', iconKey: '🍜', isDefault: true },
    { id: 'food-somen', name: 'そうめん', kana: 'そうめん', category: 'grain', iconKey: '🍝', isDefault: true },
    { id: 'food-pasta', name: 'パスタ', kana: 'ぱすた', category: 'grain', iconKey: '🍝', isDefault: true },
    { id: 'food-oatmeal', name: 'オートミール', kana: 'おーとみーる', category: 'grain', iconKey: '🥣', isDefault: true },
    { id: 'food-potato', name: 'じゃがいも', kana: 'じゃがいも', category: 'grain', iconKey: '🥔', isDefault: true },
    { id: 'food-sweetpotato', name: 'さつまいも', kana: 'さつまいも', category: 'grain', iconKey: '🍠', isDefault: true },

    // === 野菜 ===
    { id: 'food-carrot', name: 'にんじん', kana: 'にんじん', category: 'vegetable', iconKey: '🥕', isDefault: true },
    { id: 'food-spinach', name: 'ほうれん草', kana: 'ほうれんそう', category: 'vegetable', iconKey: '🥬', isDefault: true },
    { id: 'food-komatsuna', name: '小松菜', kana: 'こまつな', category: 'vegetable', iconKey: '🥬', isDefault: true },
    { id: 'food-kabocha', name: 'かぼちゃ', kana: 'かぼちゃ', category: 'vegetable', iconKey: '🎃', isDefault: true },
    { id: 'food-broccoli', name: 'ブロッコリー', kana: 'ぶろっこりー', category: 'vegetable', iconKey: '🥦', isDefault: true },
    { id: 'food-tomato', name: 'トマト', kana: 'とまと', category: 'vegetable', iconKey: '🍅', isDefault: true },
    { id: 'food-daikon', name: '大根', kana: 'だいこん', category: 'vegetable', iconKey: '🥬', isDefault: true },
    { id: 'food-cabbage', name: 'キャベツ', kana: 'きゃべつ', category: 'vegetable', iconKey: '🥬', isDefault: true },
    { id: 'food-onion', name: '玉ねぎ', kana: 'たまねぎ', category: 'vegetable', iconKey: '🧅', isDefault: true },
    { id: 'food-corn', name: 'とうもろこし', kana: 'とうもろこし', category: 'vegetable', iconKey: '🌽', isDefault: true },
    { id: 'food-greenbean', name: 'いんげん', kana: 'いんげん', category: 'vegetable', iconKey: '🫛', isDefault: true },
    { id: 'food-pea', name: 'えんどう豆', kana: 'えんどうまめ', category: 'vegetable', iconKey: '🫛', isDefault: true },
    { id: 'food-asparagus', name: 'アスパラガス', kana: 'あすぱらがす', category: 'vegetable', iconKey: '🌿', isDefault: true },

    // === 果物 ===
    { id: 'food-banana', name: 'バナナ', kana: 'ばなな', category: 'fruit', iconKey: '🍌', isDefault: true },
    { id: 'food-apple', name: 'りんご', kana: 'りんご', category: 'fruit', iconKey: '🍎', isDefault: true },
    { id: 'food-strawberry', name: 'いちご', kana: 'いちご', category: 'fruit', iconKey: '🍓', isDefault: true },
    { id: 'food-peach', name: 'もも', kana: 'もも', category: 'fruit', iconKey: '🍑', isDefault: true },
    { id: 'food-pear', name: '梨', kana: 'なし', category: 'fruit', iconKey: '🍐', isDefault: true },
    { id: 'food-orange', name: 'みかん', kana: 'みかん', category: 'fruit', iconKey: '🍊', isDefault: true },
    { id: 'food-grape', name: 'ぶどう', kana: 'ぶどう', category: 'fruit', iconKey: '🍇', isDefault: true },
    { id: 'food-melon', name: 'メロン', kana: 'めろん', category: 'fruit', iconKey: '🍈', isDefault: true },
    { id: 'food-kiwi', name: 'キウイ', kana: 'きうい', category: 'fruit', iconKey: '🥝', isDefault: true },

    // === たんぱく質 ===
    { id: 'food-tofu', name: '豆腐', kana: 'とうふ', category: 'protein', iconKey: '🧊', isDefault: true },
    { id: 'food-egg', name: '卵', kana: 'たまご', category: 'protein', iconKey: '🥚', isDefault: true },
    { id: 'food-chicken', name: '鶏肉', kana: 'とりにく', category: 'protein', iconKey: '🍗', isDefault: true },
    { id: 'food-pork', name: '豚肉', kana: 'ぶたにく', category: 'protein', iconKey: '🥩', isDefault: true },
    { id: 'food-beef', name: '牛肉', kana: 'ぎゅうにく', category: 'protein', iconKey: '🥩', isDefault: true },
    { id: 'food-natto', name: '納豆', kana: 'なっとう', category: 'protein', iconKey: '🫘', isDefault: true },
    { id: 'food-edamame', name: '枝豆', kana: 'えだまめ', category: 'protein', iconKey: '🫛', isDefault: true },
    { id: 'food-liver', name: 'レバー', kana: 'ればー', category: 'protein', iconKey: '🍖', isDefault: true },

    // === 乳製品 ===
    { id: 'food-yogurt', name: 'ヨーグルト', kana: 'よーぐると', category: 'dairy', iconKey: '🥛', isDefault: true },
    { id: 'food-cheese', name: 'チーズ', kana: 'ちーず', category: 'dairy', iconKey: '🧀', isDefault: true },
    { id: 'food-milk', name: '牛乳', kana: 'ぎゅうにゅう', category: 'dairy', iconKey: '🥛', isDefault: true },
    { id: 'food-butter', name: 'バター', kana: 'ばたー', category: 'dairy', iconKey: '🧈', isDefault: true },

    // === 魚介類 ===
    { id: 'food-shirasu', name: 'しらす', kana: 'しらす', category: 'seafood', iconKey: '🐟', isDefault: true },
    { id: 'food-salmon', name: '鮭', kana: 'さけ', category: 'seafood', iconKey: '🐟', isDefault: true },
    { id: 'food-cod', name: 'たら', kana: 'たら', category: 'seafood', iconKey: '🐟', isDefault: true },
    { id: 'food-tuna', name: 'まぐろ', kana: 'まぐろ', category: 'seafood', iconKey: '🐟', isDefault: true },
    { id: 'food-sea-bream', name: '鯛', kana: 'たい', category: 'seafood', iconKey: '🐟', isDefault: true },
    { id: 'food-shrimp', name: 'えび', kana: 'えび', category: 'seafood', iconKey: '🦐', isDefault: true },
    { id: 'food-seaweed', name: '海苔', kana: 'のり', category: 'seafood', iconKey: '🌿', isDefault: true },
    { id: 'food-wakame', name: 'わかめ', kana: 'わかめ', category: 'seafood', iconKey: '🌿', isDefault: true },

    // === 調味料 ===
    { id: 'food-dashi', name: 'だし', kana: 'だし', category: 'seasoning', iconKey: '🍲', isDefault: true },
    { id: 'food-soy-sauce', name: '醤油', kana: 'しょうゆ', category: 'seasoning', iconKey: '🧂', isDefault: true },
    { id: 'food-miso', name: '味噌', kana: 'みそ', category: 'seasoning', iconKey: '🫕', isDefault: true },
    { id: 'food-salt', name: '塩', kana: 'しお', category: 'seasoning', iconKey: '🧂', isDefault: true },
    { id: 'food-sugar', name: '砂糖', kana: 'さとう', category: 'seasoning', iconKey: '🍬', isDefault: true },
    { id: 'food-oil', name: '油', kana: 'あぶら', category: 'seasoning', iconKey: '🫒', isDefault: true },
];
