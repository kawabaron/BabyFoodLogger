import { create } from 'zustand';
import {
    getAllBabyFoodTypes,
    getAllFoods,
    searchFoods,
    seedDefaultMastersIfNeeded,
} from '../repositories/masterRepository';
import type { BabyFoodTypeMaster, FoodMaster } from '../types/domain';

interface MasterState {
    foods: FoodMaster[];
    babyFoodTypes: BabyFoodTypeMaster[];
    isLoaded: boolean;

    loadMasters: () => Promise<void>;
    seedDefaultMastersIfNeeded: () => Promise<void>;
    getSearchedFoods: (keyword: string) => Promise<FoodMaster[]>;
    getFoodById: (id: string) => FoodMaster | undefined;
    getBabyFoodTypeById: (id: string) => BabyFoodTypeMaster | undefined;
}

export const useMasterStore = create<MasterState>((set, get) => ({
    foods: [],
    babyFoodTypes: [],
    isLoaded: false,

    loadMasters: async () => {
        const [foods, babyFoodTypes] = await Promise.all([
            getAllFoods(),
            getAllBabyFoodTypes(),
        ]);
        set({ foods, babyFoodTypes, isLoaded: true });
    },

    seedDefaultMastersIfNeeded: async () => {
        await seedDefaultMastersIfNeeded();
    },

    getSearchedFoods: async (keyword: string) => {
        if (!keyword.trim()) return get().foods;
        return searchFoods(keyword);
    },

    getFoodById: (id: string) => {
        return get().foods.find(f => f.id === id);
    },

    getBabyFoodTypeById: (id: string) => {
        return get().babyFoodTypes.find(b => b.id === id);
    },
}));
