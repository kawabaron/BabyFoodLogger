// ===== Enums / Union Types =====

export type MealTiming = 'morning' | 'lunch' | 'dinner' | 'snack';

export type BabyFoodType =
  | 'okayu'
  | 'paste'
  | 'soup'
  | 'mashed'
  | 'finger_food'
  | 'other';

export type PreferenceLevel =
  | 'allergy'
  | 'dislike'
  | 'weak'
  | 'normal'
  | 'like'
  | 'love';

export type FoodCategory =
  | 'grain'
  | 'vegetable'
  | 'fruit'
  | 'protein'
  | 'dairy'
  | 'seafood'
  | 'seasoning'
  | 'dish'
  | 'other';

// ===== Master Data =====

export type FoodMaster = {
  id: string;
  name: string;
  kana?: string;
  category: FoodCategory;
  iconKey: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BabyFoodTypeMaster = {
  id: string;
  name: string;
  iconKey: string;
  sortOrder: number;
};

// ===== Records =====

export type MealRecord = {
  id: string;
  childId: string;
  date: string;              // YYYY-MM-DD
  mealTiming?: MealTiming;
  time?: string;             // HH:mm
  babyFoodTypeId?: string;
  note?: string;
  allergyReactionMemo?: string;
  appetiteLevel?: 'low' | 'normal' | 'high';
  photoIds: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type MealRecordFood = {
  id: string;
  mealRecordId: string;
  foodId: string;
  amountLevel?: 'small' | 'medium' | 'large';
  isFirstTime?: boolean;
  preferenceAtMeal?: PreferenceLevel;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type PhotoAsset = {
  id: string;
  localUri: string;
  thumbnailUri?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
};

// ===== Derived / Aggregated =====

export type FoodPreferenceProfile = {
  id: string;
  childId: string;
  foodId: string;
  latestPreference: PreferenceLevel;
  latestMemo?: string;
  isAllergyFlag: boolean;
  firstTriedDate?: string;
  lastTriedDate?: string;
  totalTriedCount: number;
  updatedAt: string;
};

export type ChildProfile = {
  id: string;
  name: string;
  birthDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type CalendarDaySummary = {
  date: string;
  mealCount: number;
  representativeFoodIconKeys: string[];
  hasFirstTriedFood: boolean;
  hasAllergyMemo: boolean;
};

// ===== Form Input Types =====

export type MealRecordInput = {
  date: string;
  mealTiming?: MealTiming;
  time?: string;
  babyFoodTypeId?: string;
  note?: string;
  allergyReactionMemo?: string;
  appetiteLevel?: 'low' | 'normal' | 'high';
  foods: MealRecordFoodInput[];
};

export type MealRecordFoodInput = {
  foodId: string;
  amountLevel?: 'small' | 'medium' | 'large';
  isFirstTime?: boolean;
  preferenceAtMeal?: PreferenceLevel;
  note?: string;
};
