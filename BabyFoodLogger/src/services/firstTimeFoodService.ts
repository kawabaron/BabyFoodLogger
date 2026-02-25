import { getDatabase } from '../repositories/database';
import {
    checkIsFirstTimeFood,
    getMealRecordFoodsByRecordId,
} from '../repositories/mealRecordRepository';
import { getNow } from '../utils/date';

/**
 * MealRecord保存時に各食材のisFirstTimeを判定する
 */
export async function determineFirstTimeFoods(
    foodIds: string[],
    excludeMealRecordId?: string
): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();
    for (const foodId of foodIds) {
        const isFirst = await checkIsFirstTimeFood(foodId, excludeMealRecordId);
        result.set(foodId, isFirst);
    }
    return result;
}

/**
 * 記録保存後にisFirstTimeフラグを更新する
 */
export async function updateFirstTimeFlags(mealRecordId: string): Promise<void> {
    const db = await getDatabase();
    const foods = await getMealRecordFoodsByRecordId(mealRecordId);
    const now = getNow();

    for (const food of foods) {
        const isFirst = await checkIsFirstTimeFood(food.foodId, mealRecordId);
        // 自分自身を除外した結果、他に記録がなければ自分が初回
        const actualIsFirst = isFirst; // この食材が他に出現しない = 自分が初回
        await db.runAsync(
            `UPDATE meal_record_foods SET isFirstTime = ?, updatedAt = ?
       WHERE id = ?`,
            actualIsFirst ? 1 : 0, now, food.id
        );
    }
}
