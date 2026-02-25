import type { BabyFoodTypeMaster } from '../types/domain';

/** デフォルト離乳食種類マスタ */
export const defaultBabyFoodTypes: BabyFoodTypeMaster[] = [
    { id: 'bft-okayu', name: 'おかゆ', iconKey: '🍚', sortOrder: 1 },
    { id: 'bft-paste', name: 'ペースト', iconKey: '🥣', sortOrder: 2 },
    { id: 'bft-soup', name: 'スープ', iconKey: '🍲', sortOrder: 3 },
    { id: 'bft-mashed', name: 'つぶし', iconKey: '🥘', sortOrder: 4 },
    { id: 'bft-finger', name: '手づかみ食べ', iconKey: '🤏', sortOrder: 5 },
    { id: 'bft-other', name: 'その他', iconKey: '🍽️', sortOrder: 6 },
];
