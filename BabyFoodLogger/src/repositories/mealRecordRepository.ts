import type { FoodPreferenceProfile, MealRecord, MealRecordFood, MealRecordInput } from '../types/domain';
import { DEFAULT_CHILD_ID } from '../utils/constants';
import { getNow } from '../utils/date';
import { generateId } from '../utils/id';
import { getDatabase } from './database';

// ===== MealRecord =====

export async function getMealRecordsByMonth(month: string): Promise<MealRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MealRecord & { photoIds: string }>(
        `SELECT * FROM meal_records
     WHERE date LIKE ? AND deletedAt IS NULL
     ORDER BY date, mealTiming`,
        `${month}%`
    );
    return rows.map(row => ({
        ...row,
        photoIds: JSON.parse(row.photoIds as string),
    }));
}

export async function getMealRecordsByDate(date: string): Promise<MealRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MealRecord & { photoIds: string }>(
        `SELECT * FROM meal_records
     WHERE date = ? AND deletedAt IS NULL
     ORDER BY mealTiming, time`,
        date
    );
    return rows.map(row => ({
        ...row,
        photoIds: JSON.parse(row.photoIds as string),
    }));
}

export async function getMealRecordById(id: string): Promise<MealRecord | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<MealRecord & { photoIds: string }>(
        'SELECT * FROM meal_records WHERE id = ? AND deletedAt IS NULL', id
    );
    if (!row) return null;
    return { ...row, photoIds: JSON.parse(row.photoIds as string) };
}

export async function addMealRecord(
    input: MealRecordInput,
    photoIds: string[] = []
): Promise<string> {
    const db = await getDatabase();
    const now = getNow();
    const id = generateId();

    await db.runAsync(
        `INSERT INTO meal_records
     (id, childId, date, mealTiming, time, babyFoodTypeId, note, allergyReactionMemo,
      appetiteLevel, photoIds, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, DEFAULT_CHILD_ID, input.date, input.mealTiming, input.time ?? null,
        input.babyFoodTypeId ?? null, input.note ?? null, input.allergyReactionMemo ?? null,
        input.appetiteLevel ?? null, JSON.stringify(photoIds), now, now
    );

    // 食材の保存
    for (const food of input.foods) {
        const foodRecordId = generateId();
        await db.runAsync(
            `INSERT INTO meal_record_foods
       (id, mealRecordId, foodId, amountLevel, isFirstTime, preferenceAtMeal, note, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            foodRecordId, id, food.foodId, food.amountLevel ?? null,
            food.isFirstTime ? 1 : 0, food.preferenceAtMeal ?? null,
            food.note ?? null, now, now
        );
    }

    return id;
}

export async function updateMealRecord(
    id: string,
    input: MealRecordInput,
    photoIds: string[] = []
): Promise<void> {
    const db = await getDatabase();
    const now = getNow();

    await db.runAsync(
        `UPDATE meal_records SET
     date = ?, mealTiming = ?, time = ?, babyFoodTypeId = ?,
     note = ?, allergyReactionMemo = ?, appetiteLevel = ?,
     photoIds = ?, updatedAt = ?
     WHERE id = ?`,
        input.date, input.mealTiming, input.time ?? null,
        input.babyFoodTypeId ?? null, input.note ?? null, input.allergyReactionMemo ?? null,
        input.appetiteLevel ?? null, JSON.stringify(photoIds), now, id
    );

    // 既存の食材記録を削除して再作成
    await db.runAsync('DELETE FROM meal_record_foods WHERE mealRecordId = ?', id);

    for (const food of input.foods) {
        const foodRecordId = generateId();
        await db.runAsync(
            `INSERT INTO meal_record_foods
       (id, mealRecordId, foodId, amountLevel, isFirstTime, preferenceAtMeal, note, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            foodRecordId, id, food.foodId, food.amountLevel ?? null,
            food.isFirstTime ? 1 : 0, food.preferenceAtMeal ?? null,
            food.note ?? null, now, now
        );
    }
}

export async function deleteMealRecord(id: string): Promise<void> {
    const db = await getDatabase();
    const now = getNow();
    await db.runAsync(
        'UPDATE meal_records SET deletedAt = ?, updatedAt = ? WHERE id = ?',
        now, now, id
    );
}

// ===== MealRecordFood =====

export async function getMealRecordFoodsByRecordId(mealRecordId: string): Promise<MealRecordFood[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MealRecordFood>(
        'SELECT * FROM meal_record_foods WHERE mealRecordId = ?',
        mealRecordId
    );
    return rows.map(row => ({
        ...row,
        isFirstTime: Boolean(row.isFirstTime),
    }));
}

export async function getMealRecordFoodsByMonth(month: string): Promise<MealRecordFood[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MealRecordFood>(
        `SELECT mrf.* FROM meal_record_foods mrf
     INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
     WHERE mr.date LIKE ? AND mr.deletedAt IS NULL`,
        `${month}%`
    );
    return rows.map(row => ({
        ...row,
        isFirstTime: Boolean(row.isFirstTime),
    }));
}

export async function getAllMealRecordFoods(): Promise<MealRecordFood[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MealRecordFood>(
        `SELECT mrf.* FROM meal_record_foods mrf
     INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
     WHERE mr.deletedAt IS NULL`
    );
    return rows.map(row => ({
        ...row,
        isFirstTime: Boolean(row.isFirstTime),
    }));
}

// ===== FoodPreferenceProfile =====

export async function upsertFoodPreferenceProfile(
    profile: Omit<FoodPreferenceProfile, 'id'>
): Promise<void> {
    const db = await getDatabase();
    const id = generateId();
    await db.runAsync(
        `INSERT INTO food_preference_profiles
     (id, childId, foodId, latestPreference, latestMemo, isAllergyFlag,
      firstTriedDate, lastTriedDate, totalTriedCount, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(childId, foodId) DO UPDATE SET
       latestPreference = excluded.latestPreference,
       latestMemo = excluded.latestMemo,
       isAllergyFlag = excluded.isAllergyFlag,
       firstTriedDate = excluded.firstTriedDate,
       lastTriedDate = excluded.lastTriedDate,
       totalTriedCount = excluded.totalTriedCount,
       updatedAt = excluded.updatedAt`,
        id, profile.childId, profile.foodId, profile.latestPreference,
        profile.latestMemo ?? null, profile.isAllergyFlag ? 1 : 0,
        profile.firstTriedDate ?? null, profile.lastTriedDate ?? null,
        profile.totalTriedCount, profile.updatedAt
    );
}

export async function getAllFoodPreferenceProfiles(): Promise<FoodPreferenceProfile[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<FoodPreferenceProfile>(
        `SELECT * FROM food_preference_profiles WHERE childId = ? ORDER BY updatedAt DESC`,
        DEFAULT_CHILD_ID
    );
    return rows.map(row => ({
        ...row,
        isAllergyFlag: Boolean(row.isAllergyFlag),
    }));
}

export async function updateFoodPreferenceManually(
    foodId: string,
    preference: string,
    memo?: string
): Promise<void> {
    const db = await getDatabase();
    const now = getNow();
    await db.runAsync(
        `UPDATE food_preference_profiles SET
     latestPreference = ?, latestMemo = ?, isAllergyFlag = ?, updatedAt = ?
     WHERE childId = ? AND foodId = ?`,
        preference, memo ?? null, preference === 'allergy' ? 1 : 0, now,
        DEFAULT_CHILD_ID, foodId
    );
}

// ===== Helpers for isFirstTime =====

export async function checkIsFirstTimeFood(
    foodId: string,
    excludeMealRecordId?: string
): Promise<boolean> {
    const db = await getDatabase();
    let query = `
    SELECT COUNT(*) as count FROM meal_record_foods mrf
    INNER JOIN meal_records mr ON mrf.mealRecordId = mr.id
    WHERE mrf.foodId = ? AND mr.deletedAt IS NULL AND mr.childId = ?
  `;
    const params: (string | number)[] = [foodId, DEFAULT_CHILD_ID];

    if (excludeMealRecordId) {
        query += ' AND mrf.mealRecordId != ?';
        params.push(excludeMealRecordId);
    }

    const result = await db.getFirstAsync<{ count: number }>(query, ...params);
    return !result || result.count === 0;
}

// ===== Export / Import =====

export async function exportAllData(): Promise<string> {
    const db = await getDatabase();
    const mealRecords = await db.getAllAsync('SELECT * FROM meal_records');
    const mealRecordFoods = await db.getAllAsync('SELECT * FROM meal_record_foods');
    const photos = await db.getAllAsync('SELECT * FROM photo_assets');
    const preferences = await db.getAllAsync('SELECT * FROM food_preference_profiles');
    const foods = await db.getAllAsync('SELECT * FROM food_masters');

    return JSON.stringify({
        version: 1,
        exportedAt: getNow(),
        mealRecords,
        mealRecordFoods,
        photos,
        preferences,
        foods,
    }, null, 2);
}
