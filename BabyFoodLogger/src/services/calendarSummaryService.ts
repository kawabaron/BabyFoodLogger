import { getDatabase } from '../repositories/database';
import type { CalendarDaySummary } from '../types/domain';
import { DEFAULT_CHILD_ID } from '../utils/constants';

/**
 * 指定月のカレンダー日別サマリを生成
 */
export async function getMonthCalendarSummaries(
    month: string
): Promise<Map<string, CalendarDaySummary>> {
    const db = await getDatabase();
    const summaries = new Map<string, CalendarDaySummary>();

    // その月の全レコードを取得
    const records = await db.getAllAsync<{
        date: string;
        id: string;
        allergyReactionMemo: string | null;
    }>(
        `SELECT date, id, allergyReactionMemo FROM meal_records
     WHERE date LIKE ? AND deletedAt IS NULL AND childId = ?
     ORDER BY date`,
        `${month}%`, DEFAULT_CHILD_ID
    );

    // 日付ごとにグループ化
    const recordsByDate = new Map<string, typeof records>();
    for (const r of records) {
        const existing = recordsByDate.get(r.date) || [];
        existing.push(r);
        recordsByDate.set(r.date, existing);
    }

    // 各日のサマリを生成
    for (const [date, dayRecords] of recordsByDate) {
        const mealCount = dayRecords.length;
        const hasAllergyMemo = dayRecords.some(
            r => r.allergyReactionMemo && r.allergyReactionMemo.length > 0
        );

        // その日の全食材を取得（代表アイコン用）
        const recordIds = dayRecords.map(r => r.id);
        const placeholders = recordIds.map(() => '?').join(',');

        const foods = await db.getAllAsync<{
            iconKey: string;
            isFirstTime: number;
        }>(
            `SELECT fm.iconKey, mrf.isFirstTime
       FROM meal_record_foods mrf
       INNER JOIN food_masters fm ON mrf.foodId = fm.id
       WHERE mrf.mealRecordId IN (${placeholders})
       LIMIT 10`,
            ...recordIds
        );

        // 代表アイコン（最大3個、ユニーク）
        const iconSet = new Set<string>();
        const representativeIcons: string[] = [];
        for (const f of foods) {
            if (!iconSet.has(f.iconKey) && representativeIcons.length < 3) {
                iconSet.add(f.iconKey);
                representativeIcons.push(f.iconKey);
            }
        }

        const hasFirstTriedFood = foods.some(f => f.isFirstTime === 1);

        summaries.set(date, {
            date,
            mealCount,
            representativeFoodIconKeys: representativeIcons,
            hasFirstTriedFood,
            hasAllergyMemo,
        });
    }

    return summaries;
}
