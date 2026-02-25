import { getDatabase } from '../repositories/database';
import { upsertFoodPreferenceProfile } from '../repositories/mealRecordRepository';
import type { PreferenceLevel } from '../types/domain';
import { DEFAULT_CHILD_ID } from '../utils/constants';
import { getNow } from '../utils/date';

/**
 * 指定食材のFoodPreferenceProfileを再計算・更新する
 */
export async function recalculateFoodPreference(foodId: string): Promise<void> {
    const db = await getDatabase();
    const now = getNow();

    // その食材を含む全てのMealRecordFoodを取得（論理削除されたレコードは除外）
    const rows = await db.getAllAsync<{
        preferenceAtMeal: PreferenceLevel | null;
        date: string;
        updatedAt: string;
    }>(
        `SELECT mrf.preferenceAtMeal, mr.date, mrf.updatedAt
     FROM meal_record_foods mrf
     INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
     WHERE mrf.foodId = ? AND mr.deletedAt IS NULL AND mr.childId = ?
     ORDER BY mr.date ASC, mrf.updatedAt ASC`,
        foodId, DEFAULT_CHILD_ID
    );

    if (rows.length === 0) return;

    const firstDate = rows[0].date;
    const lastDate = rows[rows.length - 1].date;

    // 最新の評価を取得（preferenceAtMealがあるもののうち最新）
    const withPreference = rows.filter(r => r.preferenceAtMeal);
    const latestPreference: PreferenceLevel =
        withPreference.length > 0
            ? withPreference[withPreference.length - 1].preferenceAtMeal!
            : 'normal';

    await upsertFoodPreferenceProfile({
        childId: DEFAULT_CHILD_ID,
        foodId,
        latestPreference,
        isAllergyFlag: latestPreference === 'allergy',
        firstTriedDate: firstDate,
        lastTriedDate: lastDate,
        totalTriedCount: rows.length,
        updatedAt: now,
    });
}

/**
 * 全食材のPreferenceProfileを一括再計算
 */
export async function recalculateAllFoodPreferences(): Promise<void> {
    const db = await getDatabase();
    const foods = await db.getAllAsync<{ foodId: string }>(
        `SELECT DISTINCT mrf.foodId FROM meal_record_foods mrf
     INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
     WHERE mr.deletedAt IS NULL AND mr.childId = ?`,
        DEFAULT_CHILD_ID
    );

    for (const { foodId } of foods) {
        await recalculateFoodPreference(foodId);
    }
}
