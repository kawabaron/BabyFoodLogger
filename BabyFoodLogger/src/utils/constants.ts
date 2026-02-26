import type { FoodCategory, MealTiming, PreferenceLevel } from '../types/domain';

/** デフォルトの子どもID（MVP: 単一子ども前提） */
export const DEFAULT_CHILD_ID = 'default-child';

/** 食事タイミングのラベル */
export const MEAL_TIMING_LABELS: Record<MealTiming, string> = {
    morning: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: 'おやつ',
};

export const MEAL_TIMING_ICONS: Record<MealTiming, string> = {
    morning: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍪',
};

/** 好き嫌い評価のラベル */
export const PREFERENCE_LABELS: Record<PreferenceLevel, string> = {
    allergy: 'アレルギー',
    dislike: '嫌い',
    weak: '苦手',
    normal: '普通',
    like: '好き',
    love: '大好き',
};

export const PREFERENCE_COLORS: Record<PreferenceLevel, string> = {
    allergy: '#FF3B30',
    dislike: '#FF9500',
    weak: '#FFCC00',
    normal: '#8E8E93',
    like: '#34C759',
    love: '#FF2D55',
};

export const PREFERENCE_ICONS: Record<PreferenceLevel, string> = {
    allergy: '⚠️',
    dislike: '😣',
    weak: '😐',
    normal: '🙂',
    like: '😊',
    love: '😍',
};

/** 食材カテゴリのラベル */
export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
    grain: '穀物',
    vegetable: '野菜',
    fruit: '果物',
    protein: 'たんぱく質',
    dairy: '乳製品',
    seafood: '魚介類',
    seasoning: '調味料',
    dish: '料理',
    other: 'その他',
};

export const FOOD_CATEGORY_ICONS: Record<FoodCategory, string> = {
    grain: '🌾',
    vegetable: '🥬',
    fruit: '🍎',
    protein: '🍖',
    dairy: '🥛',
    seafood: '🐟',
    seasoning: '🧂',
    dish: '🍳',
    other: '📦',
};

/** 食べた量のラベル */
export const APPETITE_LABELS: Record<string, string> = {
    low: '少ない',
    normal: '普通',
    high: '多い',
};

/** 量のラベル */
export const AMOUNT_LABELS: Record<string, string> = {
    small: '少量',
    medium: '普通',
    large: '多め',
};

/** 写真の最大枚数 */
export const MAX_PHOTOS = 3;

/** メモの最大文字数 */
export const MAX_MEMO_LENGTH = 500;
