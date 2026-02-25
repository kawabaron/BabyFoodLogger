import { getDatabase } from '../repositories/database';
import { DEFAULT_CHILD_ID } from '../utils/constants';

export type StatsData = {
    totalMealCount: number;
    totalFoodTriedCount: number;
    firstTimeFoodCount: number;
    foodRanking: Array<{ foodId: string; foodName: string; iconKey: string; count: number }>;
    categoryDistribution: Array<{ category: string; count: number }>;
    preferenceDistribution: Array<{ preference: string; count: number }>;
    allergyFoodCount: number;
};

export async function getStats(): Promise<StatsData> {
    const db = await getDatabase();

    // 総記録数
    const totalMeal = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_records
     WHERE deletedAt IS NULL AND childId = ?`,
        DEFAULT_CHILD_ID
    );

    // 総食材摂取回数（延べ）
    const totalFood = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_record_foods mrf
     INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
     WHERE mr.deletedAt IS NULL AND mr.childId = ?`,
        DEFAULT_CHILD_ID
    );

    // 初めて食べた食材数
    const firstTimeCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM meal_record_foods mrf
     INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
     WHERE mrf.isFirstTime = 1 AND mr.deletedAt IS NULL AND mr.childId = ?`,
        DEFAULT_CHILD_ID
    );

    // 食材ランキング Top10
    const ranking = await db.getAllAsync<{
        foodId: string;
        foodName: string;
        iconKey: string;
        count: number;
    }>(
        `SELECT mrf.foodId, fm.name as foodName, fm.iconKey, COUNT(*) as count
     FROM meal_record_foods mrf
     INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
     INNER JOIN food_masters fm ON mrf.foodId = fm.id
     WHERE mr.deletedAt IS NULL AND mr.childId = ?
     GROUP BY mrf.foodId
     ORDER BY count DESC
     LIMIT 10`,
        DEFAULT_CHILD_ID
    );

    // カテゴリ別回数
    const categoryDist = await db.getAllAsync<{ category: string; count: number }>(
        `SELECT fm.category, COUNT(*) as count
     FROM meal_record_foods mrf
     INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
     INNER JOIN food_masters fm ON mrf.foodId = fm.id
     WHERE mr.deletedAt IS NULL AND mr.childId = ?
     GROUP BY fm.category
     ORDER BY count DESC`,
        DEFAULT_CHILD_ID
    );

    // 好き嫌い評価分布
    const prefDist = await db.getAllAsync<{ preference: string; count: number }>(
        `SELECT latestPreference as preference, COUNT(*) as count
     FROM food_preference_profiles
     WHERE childId = ?
     GROUP BY latestPreference`,
        DEFAULT_CHILD_ID
    );

    // アレルギー食材数
    const allergyCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM food_preference_profiles
     WHERE childId = ? AND isAllergyFlag = 1`,
        DEFAULT_CHILD_ID
    );

    return {
        totalMealCount: totalMeal?.count ?? 0,
        totalFoodTriedCount: totalFood?.count ?? 0,
        firstTimeFoodCount: firstTimeCount?.count ?? 0,
        foodRanking: ranking,
        categoryDistribution: categoryDist,
        preferenceDistribution: prefDist,
        allergyFoodCount: allergyCount?.count ?? 0,
    };
}
