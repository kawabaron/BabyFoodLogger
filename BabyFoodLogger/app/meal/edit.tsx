import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { FoodMultiSelector } from '../../src/components/meal/FoodMultiSelector';
import { PhotoPickerField } from '../../src/components/meal/PhotoPickerField';
import { PreferenceSelector } from '../../src/components/meal/PreferenceSelector';
import { getMealRecordById, getMealRecordFoodsByRecordId } from '../../src/repositories/mealRecordRepository';
import { getPhotosByIds } from '../../src/repositories/photoRepository';
import { useMasterStore } from '../../src/stores/masterStore';
import { useRecordStore } from '../../src/stores/recordStore';
import { useUIStore } from '../../src/stores/uiStore';
import type { MealRecordInput, PreferenceLevel } from '../../src/types/domain';
import { AMOUNT_LABELS, APPETITE_LABELS, MAX_MEMO_LENGTH } from '../../src/utils/constants';

const AMOUNTS = ['small', 'medium', 'large'] as const;
const APPETITES = ['low', 'normal', 'high'] as const;

// 日付・時間・分のオプション生成
const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

function generateDateOptions(centerDate: string): { label: string; value: string }[] {
    const center = dayjs(centerDate);
    const options: { label: string; value: string }[] = [];
    for (let i = -30; i <= 30; i++) {
        const d = center.add(i, 'day');
        const dateStr = d.format('YYYY-MM-DD');
        const isToday = i === 0 && dateStr === dayjs().format('YYYY-MM-DD');
        const label = isToday
            ? '今日'
            : `${d.format('M月D日')} ${WEEKDAY_LABELS[d.day()]}`;
        options.push({ label, value: dateStr });
    }
    return options;
}

function generateHourOptions(): number[] {
    return Array.from({ length: 24 }, (_, i) => i);
}

function generateMinuteOptions(): number[] {
    return Array.from({ length: 12 }, (_, i) => i * 5);
}

const HOURS = generateHourOptions();
const MINUTES = generateMinuteOptions();

// ドラムロール風ピッカーコラム
function PickerColumn({
    items,
    selectedIndex,
    onSelect,
    itemHeight = 44,
    visibleCount = 5,
}: {
    items: { label: string; value: any }[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    itemHeight?: number;
    visibleCount?: number;
}) {
    const scrollRef = useRef<ScrollView>(null);
    const halfVisible = Math.floor(visibleCount / 2);

    useEffect(() => {
        if (scrollRef.current && selectedIndex >= 0) {
            scrollRef.current.scrollTo({ y: selectedIndex * itemHeight, animated: false });
        }
    }, []);

    const handleMomentumEnd = (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        const index = Math.round(y / itemHeight);
        const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
        onSelect(clampedIndex);
        scrollRef.current?.scrollTo({ y: clampedIndex * itemHeight, animated: true });
    };

    return (
        <View style={[pickerStyles.column, { height: itemHeight * visibleCount }]}>
            <View style={[pickerStyles.selectedOverlay, { top: halfVisible * itemHeight, height: itemHeight }]} />
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: halfVisible * itemHeight }}
                onMomentumScrollEnd={handleMomentumEnd}
                onScrollEndDrag={handleMomentumEnd}
            >
                {items.map((item, i) => {
                    const isSelected = i === selectedIndex;
                    return (
                        <TouchableOpacity
                            key={`${item.value}-${i}`}
                            style={[pickerStyles.item, { height: itemHeight }]}
                            onPress={() => {
                                onSelect(i);
                                scrollRef.current?.scrollTo({ y: i * itemHeight, animated: true });
                            }}
                            activeOpacity={0.6}
                        >
                            <Text style={[pickerStyles.itemText, isSelected && pickerStyles.selectedItemText]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const pickerStyles = StyleSheet.create({
    column: { flex: 1, overflow: 'hidden' },
    selectedOverlay: {
        position: 'absolute', left: 4, right: 4,
        backgroundColor: '#F0F0F0', borderRadius: 10, zIndex: -1,
    },
    item: { justifyContent: 'center', alignItems: 'center' },
    itemText: { fontSize: 17, color: '#999' },
    selectedItemText: { fontSize: 20, fontWeight: '700', color: '#333' },
});

export default function MealEditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string; date?: string }>();
    const isEditing = !!params.id;

    const addMealRecord = useRecordStore(s => s.addMealRecord);
    const updateMealRecord = useRecordStore(s => s.updateMealRecord);
    const deleteMealRecord = useRecordStore(s => s.deleteMealRecord);
    const refreshCalendarSummaries = useRecordStore(s => s.refreshCalendarSummaries);
    const visibleMonth = useUIStore(s => s.visibleMonth);
    const getFoodByIdFn = useMasterStore(s => s.getFoodById);

    // Form state
    const initialDate = params.date || dayjs().format('YYYY-MM-DD');
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [selectedHour, setSelectedHour] = useState(dayjs().hour());
    const [selectedMinute, setSelectedMinute] = useState(Math.floor(dayjs().minute() / 5) * 5);
    const [note, setNote] = useState('');
    const [allergyMemo, setAllergyMemo] = useState('');
    const [appetiteLevel, setAppetiteLevel] = useState<'low' | 'normal' | 'high' | undefined>();
    const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
    const [foodAmounts, setFoodAmounts] = useState<Record<string, 'small' | 'medium' | 'large'>>({});
    const [foodPreferences, setFoodPreferences] = useState<Record<string, PreferenceLevel>>({});
    const [foodNotes, setFoodNotes] = useState<Record<string, string>>({});
    const [photos, setPhotos] = useState<Array<{ uri: string; id?: string }>>([]);
    const [showFoodSelector, setShowFoodSelector] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const dateOptions = useMemo(() => generateDateOptions(initialDate), [initialDate]);
    const selectedDateIndex = useMemo(() => {
        const idx = dateOptions.findIndex(o => o.value === selectedDate);
        return idx >= 0 ? idx : 30; // center
    }, [selectedDate, dateOptions]);

    const hourItems = useMemo(() => HOURS.map(h => ({ label: String(h), value: h })), []);
    const minuteItems = useMemo(() => MINUTES.map(m => ({ label: String(m).padStart(2, '0'), value: m })), []);
    const selectedMinuteIndex = useMemo(() => MINUTES.indexOf(selectedMinute), [selectedMinute]);

    // 編集時のデータ読み込み
    useEffect(() => {
        if (isEditing && params.id) {
            (async () => {
                const record = await getMealRecordById(params.id!);
                if (!record) return;
                setSelectedDate(record.date);
                if (record.time) {
                    const [h, m] = record.time.split(':').map(Number);
                    setSelectedHour(h);
                    setSelectedMinute(Math.floor(m / 5) * 5);
                }
                setNote(record.note || '');
                setAllergyMemo(record.allergyReactionMemo || '');
                setAppetiteLevel(record.appetiteLevel);

                const foods = await getMealRecordFoodsByRecordId(record.id);
                setSelectedFoodIds(foods.map(f => f.foodId));
                const amounts: Record<string, 'small' | 'medium' | 'large'> = {};
                const prefs: Record<string, PreferenceLevel> = {};
                const notes: Record<string, string> = {};
                for (const f of foods) {
                    if (f.amountLevel) amounts[f.foodId] = f.amountLevel;
                    if (f.preferenceAtMeal) prefs[f.foodId] = f.preferenceAtMeal;
                    if (f.note) notes[f.foodId] = f.note;
                }
                setFoodAmounts(amounts);
                setFoodPreferences(prefs);
                setFoodNotes(notes);

                if (record.photoIds.length > 0) {
                    const photoAssets = await getPhotosByIds(record.photoIds);
                    setPhotos(photoAssets.map(p => ({ uri: p.localUri, id: p.id })));
                }
            })();
        }
    }, [params.id]);

    const handleToggleFood = useCallback((foodId: string) => {
        setSelectedFoodIds(prev =>
            prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId]
        );
    }, []);

    const handleSave = async () => {
        if (selectedFoodIds.length === 0) {
            Alert.alert('入力エラー', '食材を1つ以上選択してください');
            return;
        }

        setIsSaving(true);
        try {
            const timeStr = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
            const input: MealRecordInput = {
                date: selectedDate,
                time: timeStr,
                note: note || undefined,
                allergyReactionMemo: allergyMemo || undefined,
                appetiteLevel,
                foods: selectedFoodIds.map(foodId => ({
                    foodId,
                    amountLevel: foodAmounts[foodId],
                    preferenceAtMeal: foodPreferences[foodId],
                    note: foodNotes[foodId] || undefined,
                })),
            };

            const newPhotoUris = photos.filter(p => !p.id).map(p => p.uri);

            if (isEditing && params.id) {
                const keptPhotoIds = photos.filter(p => p.id).map(p => p.id!);
                await updateMealRecord(params.id, input, newPhotoUris, keptPhotoIds);
            } else {
                await addMealRecord(input, newPhotoUris);
            }

            await refreshCalendarSummaries(visibleMonth);
            router.back();
        } catch (error) {
            Alert.alert('エラー', '保存に失敗しました');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('削除確認', 'この記録を削除しますか？', [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: '削除', style: 'destructive',
                onPress: async () => {
                    if (params.id) {
                        await deleteMealRecord(params.id);
                        await refreshCalendarSummaries(visibleMonth);
                        router.back();
                    }
                },
            },
        ]);
    };

    if (showFoodSelector) {
        return (
            <View style={styles.container}>
                <View style={styles.foodSelectorHeader}>
                    <TouchableOpacity onPress={() => setShowFoodSelector(false)}>
                        <Text style={styles.foodSelectorDone}>完了</Text>
                    </TouchableOpacity>
                </View>
                <FoodMultiSelector selectedFoodIds={selectedFoodIds} onToggleFood={handleToggleFood} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                {/* 日時ピッカー（iOS風ドラムロール） */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 日時</Text>
                    <View style={styles.pickerContainer}>
                        <PickerColumn
                            items={dateOptions}
                            selectedIndex={selectedDateIndex}
                            onSelect={i => setSelectedDate(dateOptions[i].value)}
                        />
                        <PickerColumn
                            items={hourItems}
                            selectedIndex={selectedHour}
                            onSelect={i => setSelectedHour(i)}
                        />
                        <PickerColumn
                            items={minuteItems}
                            selectedIndex={selectedMinuteIndex}
                            onSelect={i => setSelectedMinute(MINUTES[i])}
                        />
                    </View>
                </View>

                {/* 食材選択 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🥗 食材・料理</Text>
                        <TouchableOpacity style={styles.selectFoodButton} onPress={() => setShowFoodSelector(true)}>
                            <Text style={styles.selectFoodButtonText}>選択する</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedFoodIds.length === 0 ? (
                        <Text style={styles.placeholder}>食材・料理を選択してください</Text>
                    ) : (
                        selectedFoodIds.map(foodId => {
                            const food = getFoodByIdFn(foodId);
                            if (!food) return null;
                            return (
                                <View key={foodId} style={styles.foodCard}>
                                    <View style={styles.foodCardHeader}>
                                        <Text style={styles.foodCardName}>{food.iconKey} {food.name}</Text>
                                        <TouchableOpacity onPress={() => handleToggleFood(foodId)}>
                                            <Text style={styles.removeFoodText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* 量 */}
                                    <View style={styles.foodCardRow}>
                                        <Text style={styles.foodCardLabel}>量:</Text>
                                        <View style={styles.miniChipRow}>
                                            {AMOUNTS.map(a => (
                                                <TouchableOpacity
                                                    key={a}
                                                    style={[styles.miniChip, foodAmounts[foodId] === a && styles.activeMiniChip]}
                                                    onPress={() => setFoodAmounts(prev => ({ ...prev, [foodId]: a }))}
                                                >
                                                    <Text style={[styles.miniChipText, foodAmounts[foodId] === a && styles.activeMiniChipText]}>
                                                        {AMOUNT_LABELS[a]}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* 評価 */}
                                    <View style={styles.foodCardRow}>
                                        <Text style={styles.foodCardLabel}>評価:</Text>
                                        <PreferenceSelector
                                            value={foodPreferences[foodId]}
                                            onChange={pref => setFoodPreferences(prev => {
                                                const next = { ...prev };
                                                if (pref) next[foodId] = pref;
                                                else delete next[foodId];
                                                return next;
                                            })}
                                            compact
                                        />
                                    </View>

                                    {/* 個別メモ */}
                                    <TextInput
                                        style={styles.foodMemoInput}
                                        value={foodNotes[foodId] || ''}
                                        onChangeText={text => setFoodNotes(prev => ({ ...prev, [foodId]: text }))}
                                        placeholder="この食材のメモ..."
                                        placeholderTextColor="#CCC"
                                        maxLength={200}
                                    />
                                </View>
                            );
                        })
                    )}
                </View>

                {/* 食べた量 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>😋 食べた量</Text>
                    <View style={styles.chipRow}>
                        {APPETITES.map(a => (
                            <TouchableOpacity
                                key={a}
                                style={[styles.chip, appetiteLevel === a && styles.activeChip]}
                                onPress={() => setAppetiteLevel(appetiteLevel === a ? undefined : a)}
                            >
                                <Text style={[styles.chipText, appetiteLevel === a && styles.activeChipText]}>
                                    {APPETITE_LABELS[a]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 写真 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📷 写真</Text>
                    <PhotoPickerField
                        photos={photos}
                        onAddPhoto={uri => setPhotos(prev => [...prev, { uri }])}
                        onRemovePhoto={index => setPhotos(prev => prev.filter((_, i) => i !== index))}
                    />
                </View>

                {/* アレルギーメモ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚠️ アレルギー反応メモ</Text>
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={allergyMemo} onChangeText={setAllergyMemo}
                        placeholder="アレルギー反応があれば記録..."
                        placeholderTextColor="#CCC" multiline maxLength={MAX_MEMO_LENGTH}
                    />
                </View>

                {/* メモ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📝 メモ</Text>
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={note} onChangeText={setNote}
                        placeholder="メモを入力..."
                        placeholderTextColor="#CCC" multiline maxLength={MAX_MEMO_LENGTH}
                    />
                </View>

                {/* ボタン */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.disabledButton]}
                        onPress={handleSave} disabled={isSaving}
                    >
                        <Text style={styles.saveButtonText}>{isSaving ? '保存中...' : '保存する'}</Text>
                    </TouchableOpacity>
                    {isEditing && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Text style={styles.deleteButtonText}>🗑️ この記録を削除</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 60 },
    section: {
        backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 10 },
    textInput: {
        backgroundColor: '#F8F8F8', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#E8E8E8',
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    // 日時ピッカー
    pickerContainer: { flexDirection: 'row', height: 220, gap: 4 },
    // チップ
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 12, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', gap: 4,
    },
    activeChip: { backgroundColor: '#FF8C94', borderColor: '#FF8C94' },
    chipText: { fontSize: 13, color: '#555', fontWeight: '600' },
    activeChipText: { color: '#FFF' },
    // 食材
    selectFoodButton: { backgroundColor: '#FF8C94', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    selectFoodButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    placeholder: { fontSize: 14, color: '#CCC', textAlign: 'center', paddingVertical: 20 },
    foodCard: {
        backgroundColor: '#FAFAFA', borderRadius: 10, padding: 12, marginBottom: 8,
        borderWidth: 1, borderColor: '#F0F0F0',
    },
    foodCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    foodCardName: { fontSize: 15, fontWeight: '600', color: '#333' },
    removeFoodText: { fontSize: 16, color: '#FF3B30', fontWeight: '700', padding: 4 },
    foodCardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
    foodCardLabel: { fontSize: 13, color: '#666', width: 36 },
    miniChipRow: { flexDirection: 'row', gap: 6 },
    miniChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F0F0F0' },
    activeMiniChip: { backgroundColor: '#FF8C94' },
    miniChipText: { fontSize: 12, color: '#666' },
    activeMiniChipText: { color: '#FFF', fontWeight: '600' },
    foodMemoInput: {
        marginTop: 8, backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
        fontSize: 13, color: '#333', borderWidth: 1, borderColor: '#E8E8E8',
    },
    // ボタン
    buttonSection: { paddingHorizontal: 16, marginTop: 20, marginBottom: 40, gap: 12 },
    saveButton: {
        backgroundColor: '#FF8C94', paddingVertical: 16, borderRadius: 14, alignItems: 'center',
        shadowColor: '#FF8C94', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    disabledButton: { opacity: 0.6 },
    saveButtonText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
    deleteButton: { alignItems: 'center', paddingVertical: 14 },
    deleteButtonText: { color: '#FF3B30', fontSize: 15, fontWeight: '600' },
    foodSelectorHeader: {
        flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#FFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0',
    },
    foodSelectorDone: { fontSize: 16, fontWeight: '700', color: '#FF8C94' },
});
