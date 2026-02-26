import { z } from 'zod';

const appetiteLevelValues = ['low', 'normal', 'high'] as const;
const amountLevelValues = ['small', 'medium', 'large'] as const;
const preferenceLevelValues = ['allergy', 'dislike', 'weak', 'normal', 'like', 'love'] as const;

export const mealRecordSchema = z.object({
    date: z.string().min(1, '日付は必須です'),
    time: z.string().optional(),
    note: z.string().max(500, 'メモは500文字以内で入力してください').optional(),
    allergyReactionMemo: z
        .string()
        .max(500, 'アレルギーメモは500文字以内で入力してください')
        .optional(),
    appetiteLevel: z.enum(appetiteLevelValues).optional(),
    foods: z
        .array(
            z.object({
                foodId: z.string().min(1),
                amountLevel: z.enum(amountLevelValues).optional(),
                isFirstTime: z.boolean().optional(),
                preferenceAtMeal: z.enum(preferenceLevelValues).optional(),
                note: z.string().max(200).optional(),
            })
        )
        .min(1, '食材を1つ以上選択してください'),
});

export type MealRecordFormData = z.infer<typeof mealRecordSchema>;
