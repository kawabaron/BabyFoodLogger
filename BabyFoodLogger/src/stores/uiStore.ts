import { create } from 'zustand';
import { getCurrentMonth, getToday } from '../utils/date';

type BottomSheetSnap = 'collapsed' | 'half' | 'expanded';

interface UIState {
    selectedDate: string;
    visibleMonth: string;
    bottomSheetSnap: BottomSheetSnap;
    isMealEditorOpen: boolean;
    editingMealRecordId: string | null;

    setSelectedDate: (date: string) => void;
    setVisibleMonth: (month: string) => void;
    setBottomSheetSnap: (snap: BottomSheetSnap) => void;
    openMealEditor: (recordId?: string) => void;
    closeMealEditor: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    selectedDate: getToday(),
    visibleMonth: getCurrentMonth(),
    bottomSheetSnap: 'collapsed',
    isMealEditorOpen: false,
    editingMealRecordId: null,

    setSelectedDate: (date) =>
        set({ selectedDate: date, bottomSheetSnap: 'half' }),
    setVisibleMonth: (month) => set({ visibleMonth: month }),
    setBottomSheetSnap: (snap) => set({ bottomSheetSnap: snap }),
    openMealEditor: (recordId) =>
        set({ isMealEditorOpen: true, editingMealRecordId: recordId ?? null }),
    closeMealEditor: () =>
        set({ isMealEditorOpen: false, editingMealRecordId: null }),
}));
