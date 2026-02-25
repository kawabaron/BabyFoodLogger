import { defaultBabyFoodTypes } from '../seed/defaultBabyFoodTypes';
import { defaultFoods } from '../seed/defaultFoods';
import type { BabyFoodTypeMaster, FoodMaster } from '../types/domain';
import { getNow } from '../utils/date';
import { getDatabase } from './database';

export async function seedDefaultMastersIfNeeded(): Promise<void> {
    const db = await getDatabase();

    // Check if food masters already seeded
    const foodCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM food_masters'
    );

    if (!foodCount || foodCount.count === 0) {
        const now = getNow();
        for (const food of defaultFoods) {
            await db.runAsync(
                `INSERT OR IGNORE INTO food_masters (id, name, kana, category, iconKey, isDefault, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                food.id, food.name, food.kana ?? null, food.category, food.iconKey,
                food.isDefault ? 1 : 0, now, now
            );
        }
    }

    // Check if baby food type masters already seeded
    const bftCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM baby_food_type_masters'
    );

    if (!bftCount || bftCount.count === 0) {
        for (const bft of defaultBabyFoodTypes) {
            await db.runAsync(
                `INSERT OR IGNORE INTO baby_food_type_masters (id, name, iconKey, sortOrder)
         VALUES (?, ?, ?, ?)`,
                bft.id, bft.name, bft.iconKey, bft.sortOrder
            );
        }
    }
}

export async function getAllFoods(): Promise<FoodMaster[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<FoodMaster>(
        'SELECT * FROM food_masters ORDER BY category, name'
    );
    return rows.map(row => ({
        ...row,
        isDefault: Boolean(row.isDefault),
    }));
}

export async function searchFoods(keyword: string): Promise<FoodMaster[]> {
    const db = await getDatabase();
    const like = `%${keyword}%`;
    const rows = await db.getAllAsync<FoodMaster>(
        'SELECT * FROM food_masters WHERE name LIKE ? OR kana LIKE ? ORDER BY category, name',
        like, like
    );
    return rows.map(row => ({
        ...row,
        isDefault: Boolean(row.isDefault),
    }));
}

export async function getAllBabyFoodTypes(): Promise<BabyFoodTypeMaster[]> {
    const db = await getDatabase();
    return db.getAllAsync<BabyFoodTypeMaster>(
        'SELECT * FROM baby_food_type_masters ORDER BY sortOrder'
    );
}

export async function getFoodById(id: string): Promise<FoodMaster | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<FoodMaster>(
        'SELECT * FROM food_masters WHERE id = ?', id
    );
    if (!row) return null;
    return { ...row, isDefault: Boolean(row.isDefault) };
}

export async function getFoodsByIds(ids: string[]): Promise<FoodMaster[]> {
    if (ids.length === 0) return [];
    const db = await getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    const rows = await db.getAllAsync<FoodMaster>(
        `SELECT * FROM food_masters WHERE id IN (${placeholders})`,
        ...ids
    );
    return rows.map(row => ({
        ...row,
        isDefault: Boolean(row.isDefault),
    }));
}
