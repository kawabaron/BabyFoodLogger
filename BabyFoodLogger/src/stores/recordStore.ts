import { create } from 'zustand';
import * as mealRepo from '../repositories/mealRecordRepository';
import * as photoRepo from '../repositories/photoRepository';
import { getMonthCalendarSummaries } from '../services/calendarSummaryService';
import { updateFirstTimeFlags } from '../services/firstTimeFoodService';
import { recalculateFoodPreference } from '../services/foodPreferenceAggregationService';
import type {
    CalendarDaySummary,
    FoodPreferenceProfile,
    MealRecord,
    MealRecordFood,
    MealRecordInput,
    PhotoAsset,
} from '../types/domain';

interface RecordState {
    mealRecords: MealRecord[];
    mealRecordFoods: Map<string, MealRecordFood[]>;
    photos: Map<string, PhotoAsset[]>;
    calendarSummaries: Map<string, CalendarDaySummary>;
    foodPreferenceProfiles: FoodPreferenceProfile[];
    isLoading: boolean;

    loadByMonth: (month: string) => Promise<void>;
    getRecordsByDate: (date: string) => MealRecord[];
    getFoodsForRecord: (recordId: string) => Promise<MealRecordFood[]>;
    getPhotosForRecord: (recordId: string) => Promise<PhotoAsset[]>;

    addMealRecord: (input: MealRecordInput, photoUris?: string[]) => Promise<string>;
    updateMealRecord: (id: string, input: MealRecordInput, photoUris?: string[], existingPhotoIds?: string[]) => Promise<void>;
    deleteMealRecord: (id: string) => Promise<void>;

    refreshCalendarSummaries: (month: string) => Promise<void>;
    loadFoodPreferences: () => Promise<void>;
}

export const useRecordStore = create<RecordState>((set, get) => ({
    mealRecords: [],
    mealRecordFoods: new Map(),
    photos: new Map(),
    calendarSummaries: new Map(),
    foodPreferenceProfiles: [],
    isLoading: false,

    loadByMonth: async (month: string) => {
        set({ isLoading: true });
        try {
            const records = await mealRepo.getMealRecordsByMonth(month);
            const summaries = await getMonthCalendarSummaries(month);
            set({ mealRecords: records, calendarSummaries: summaries });
        } finally {
            set({ isLoading: false });
        }
    },

    getRecordsByDate: (date: string) => {
        return get().mealRecords.filter(r => r.date === date && !r.deletedAt);
    },

    getFoodsForRecord: async (recordId: string) => {
        const cached = get().mealRecordFoods.get(recordId);
        if (cached) return cached;
        const foods = await mealRepo.getMealRecordFoodsByRecordId(recordId);
        set(state => {
            const newMap = new Map(state.mealRecordFoods);
            newMap.set(recordId, foods);
            return { mealRecordFoods: newMap };
        });
        return foods;
    },

    getPhotosForRecord: async (recordId: string) => {
        const cached = get().photos.get(recordId);
        if (cached) return cached;
        const record = get().mealRecords.find(r => r.id === recordId);
        if (!record || record.photoIds.length === 0) return [];
        const photos = await photoRepo.getPhotosByIds(record.photoIds);
        set(state => {
            const newMap = new Map(state.photos);
            newMap.set(recordId, photos);
            return { photos: newMap };
        });
        return photos;
    },

    addMealRecord: async (input, photoUris = []) => {
        // 写真を保存
        const savedPhotos: PhotoAsset[] = [];
        for (const uri of photoUris) {
            const photo = await photoRepo.savePhoto(uri);
            savedPhotos.push(photo);
        }
        const photoIds = savedPhotos.map(p => p.id);

        // 記録を保存
        const id = await mealRepo.addMealRecord(input, photoIds);

        // isFirstTime更新
        await updateFirstTimeFlags(id);

        // 食材の好み集約を更新
        const foodIds = input.foods.map(f => f.foodId);
        for (const foodId of foodIds) {
            await recalculateFoodPreference(foodId);
        }

        return id;
    },

    updateMealRecord: async (id, input, photoUris = [], existingPhotoIds = []) => {
        // 新しい写真を保存
        const newPhotos: PhotoAsset[] = [];
        for (const uri of photoUris) {
            const photo = await photoRepo.savePhoto(uri);
            newPhotos.push(photo);
        }
        const allPhotoIds = [...existingPhotoIds, ...newPhotos.map(p => p.id)];

        // 更新前の食材IDを取得（好み再計算用）
        const oldFoods = await mealRepo.getMealRecordFoodsByRecordId(id);
        const oldFoodIds = oldFoods.map(f => f.foodId);

        // 記録を更新
        await mealRepo.updateMealRecord(id, input, allPhotoIds);

        // isFirstTime更新
        await updateFirstTimeFlags(id);

        // 古い食材と新しい食材両方の好み集約を更新
        const newFoodIds = input.foods.map(f => f.foodId);
        const allFoodIds = [...new Set([...oldFoodIds, ...newFoodIds])];
        for (const foodId of allFoodIds) {
            await recalculateFoodPreference(foodId);
        }
    },

    deleteMealRecord: async (id: string) => {
        // 削除前の食材IDを取得
        const foods = await mealRepo.getMealRecordFoodsByRecordId(id);
        const foodIds = foods.map(f => f.foodId);

        // 論理削除
        await mealRepo.deleteMealRecord(id);

        // 食材の好み集約を更新
        for (const foodId of foodIds) {
            await recalculateFoodPreference(foodId);
        }
    },

    refreshCalendarSummaries: async (month: string) => {
        const summaries = await getMonthCalendarSummaries(month);
        // 月データも再読み込み
        const records = await mealRepo.getMealRecordsByMonth(month);
        set({ calendarSummaries: summaries, mealRecords: records });
    },

    loadFoodPreferences: async () => {
        const profiles = await mealRepo.getAllFoodPreferenceProfiles();
        set({ foodPreferenceProfiles: profiles });
    },
}));
