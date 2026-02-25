import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import type { MealRecordInput, MealTiming, PreferenceLevel } from '../../src/types/domain';
import {
    AMOUNT_LABELS,
    APPETITE_LABELS,
    MAX_MEMO_LENGTH,
    MEAL_TIMING_ICONS,
    MEAL_TIMING_LABELS,
} from '../../src/utils/constants';

const TIMINGS: MealTiming[] = ['morning', 'lunch', 'dinner', 'snack'];
const AMOUNTS = ['small', 'medium', 'large'] as const;
const APPETITES = ['low', 'normal', 'high'] as const;

export default function MealEditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string; date?: string }>();
    const isEditing = !!params.id;

    const addMealRecord = useRecordStore(s => s.addMealRecord);
    const updateMealRecord = useRecordStore(s => s.updateMealRecord);
    const deleteMealRecord = useRecordStore(s => s.deleteMealRecord);
    const refreshCalendarSummaries = useRecordStore(s => s.refreshCalendarSummaries);
    const visibleMonth = useUIStore(s => s.visibleMonth);
    const babyFoodTypes = useMasterStore(s => s.babyFoodTypes);
    const getFoodByIdFn = useMasterStore(s => s.getFoodById);

    // Form state
    const [date, setDate] = useState(params.date || '');
    const [mealTiming, setMealTiming] = useState<MealTiming>('morning');
    const [time, setTime] = useState('');
    const [babyFoodTypeId, setBabyFoodTypeId] = useState('');
    const [note, setNote] = useState('');
    const [allergyMemo, setAllergyMemo] = useState('');
    const [appetiteLevel, setAppetiteLevel] = useState<'low' | 'normal' | 'high' | undefined>();
    const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
    const [foodAmounts, setFoodAmounts] = useState<Record<string, 'small' | 'medium' | 'large'>>({});
    const [foodPreferences, setFoodPreferences] = useState<Record<string, PreferenceLevel>>({});
    const [photos, setPhotos] = useState<Array<{ uri: string; id?: string }>>([]);
    const [existingPhotoIds, setExistingPhotoIds] = useState<string[]>([]);
    const [showFoodSelector, setShowFoodSelector] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 編集時のデータ読み込み
    useEffect(() => {
        if (isEditing && params.id) {
            (async () => {
                const record = await getMealRecordById(params.id!);
                if (!record) return;
                setDate(record.date);
                setMealTiming(record.mealTiming);
                setTime(record.time || '');
                setBabyFoodTypeId(record.babyFoodTypeId);
                setNote(record.note || '');
                setAllergyMemo(record.allergyReactionMemo || '');
                setAppetiteLevel(record.appetiteLevel);

                const foods = await getMealRecordFoodsByRecordId(record.id);
                setSelectedFoodIds(foods.map(f => f.foodId));
                const amounts: Record<string, 'small' | 'medium' | 'large'> = {};
                const prefs: Record<string, PreferenceLevel> = {};
                for (const f of foods) {
                    if (f.amountLevel) amounts[f.foodId] = f.amountLevel;
                    if (f.preferenceAtMeal) prefs[f.foodId] = f.preferenceAtMeal;
                }
                setFoodAmounts(amounts);
                setFoodPreferences(prefs);

                if (record.photoIds.length > 0) {
                    const photoAssets = await getPhotosByIds(record.photoIds);
                    setPhotos(photoAssets.map(p => ({ uri: p.localUri, id: p.id })));
                    setExistingPhotoIds(record.photoIds);
                }
            })();
        } else {
            // 新規の場合、デフォルト離乳食種類を設定
            if (babyFoodTypes.length > 0) {
                setBabyFoodTypeId(babyFoodTypes[0].id);
            }
        }
    }, [params.id]);

    const handleToggleFood = useCallback((foodId: string) => {
        setSelectedFoodIds(prev =>
            prev.includes(foodId)
                ? prev.filter(id => id !== foodId)
                : [...prev, foodId]
        );
    }, []);

    const handleSave = async () => {
        // バリデーション
        if (!date) {
            Alert.alert('入力エラー', '日付は必須です');
            return;
        }
        if (!babyFoodTypeId) {
            Alert.alert('入力エラー', '離乳食の種類を選択してください');
            return;
        }
        if (selectedFoodIds.length === 0) {
            Alert.alert('入力エラー', '食材を1つ以上選択してください');
            return;
        }
        if (note.length > MAX_MEMO_LENGTH) {
            Alert.alert('入力エラー', `メモは${MAX_MEMO_LENGTH}文字以内で入力してください`);
            return;
        }

        setIsSaving(true);
        try {
            const input: MealRecordInput = {
                date,
                mealTiming,
                time: time || undefined,
                babyFoodTypeId,
                note: note || undefined,
                allergyReactionMemo: allergyMemo || undefined,
                appetiteLevel,
                foods: selectedFoodIds.map(foodId => ({
                    foodId,
                    amountLevel: foodAmounts[foodId],
                    preferenceAtMeal: foodPreferences[foodId],
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
                text: '削除',
                style: 'destructive',
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
                <FoodMultiSelector
                    selectedFoodIds={selectedFoodIds}
                    onToggleFood={handleToggleFood}
                />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* 日付 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 日付</Text>
                    <TextInput
                        style={styles.textInput}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#CCC"
                    />
                </View>

                {/* 食事タイミング */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🕐 食事タイミング</Text>
                    <View style={styles.chipRow}>
                        {TIMINGS.map(t => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.chip, mealTiming === t && styles.activeChip]}
                                onPress={() => setMealTiming(t)}
                            >
                                <Text style={styles.chipIcon}>{MEAL_TIMING_ICONS[t]}</Text>
                                <Text style={[styles.chipText, mealTiming === t && styles.activeChipText]}>
                                    {MEAL_TIMING_LABELS[t]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 時刻 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⏰ 時刻（任意）</Text>
                    <TextInput
                        style={styles.textInput}
                        value={time}
                        onChangeText={setTime}
                        placeholder="HH:mm"
                        placeholderTextColor="#CCC"
                    />
                </View>

                {/* 離乳食の種類 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🍽️ 離乳食の種類</Text>
                    <View style={styles.chipRow}>
                        {babyFoodTypes.map(bft => (
                            <TouchableOpacity
                                key={bft.id}
                                style={[styles.chip, babyFoodTypeId === bft.id && styles.activeChip]}
                                onPress={() => setBabyFoodTypeId(bft.id)}
                            >
                                <Text style={styles.chipIcon}>{bft.iconKey}</Text>
                                <Text style={[styles.chipText, babyFoodTypeId === bft.id && styles.activeChipText]}>
                                    {bft.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 食材選択 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🥗 食材</Text>
                        <TouchableOpacity
                            style={styles.selectFoodButton}
                            onPress={() => setShowFoodSelector(true)}
                        >
                            <Text style={styles.selectFoodButtonText}>食材を選択</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedFoodIds.length === 0 ? (
                        <Text style={styles.placeholder}>食材を選択してください</Text>
                    ) : (
                        selectedFoodIds.map(foodId => {
                            const food = getFoodByIdFn(foodId);
                            if (!food) return null;
                            return (
                                <View key={foodId} style={styles.foodCard}>
                                    <View style={styles.foodCardHeader}>
                                        <Text style={styles.foodCardName}>
                                            {food.iconKey} {food.name}
                                        </Text>
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
                                                    style={[
                                                        styles.miniChip,
                                                        foodAmounts[foodId] === a && styles.activeMiniChip,
                                                    ]}
                                                    onPress={() =>
                                                        setFoodAmounts(prev => ({ ...prev, [foodId]: a }))
                                                    }
                                                >
                                                    <Text
                                                        style={[
                                                            styles.miniChipText,
                                                            foodAmounts[foodId] === a && styles.activeMiniChipText,
                                                        ]}
                                                    >
                                                        {AMOUNT_LABELS[a]}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* 好き嫌い */}
                                    <View style={styles.foodCardRow}>
                                        <Text style={styles.foodCardLabel}>評価:</Text>
                                        <PreferenceSelector
                                            value={foodPreferences[foodId]}
                                            onChange={pref =>
                                                setFoodPreferences(prev => {
                                                    const next = { ...prev };
                                                    if (pref) next[foodId] = pref;
                                                    else delete next[foodId];
                                                    return next;
                                                })
                                            }
                                            compact
                                        />
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* 食べた量 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>😋 食べた量の印象</Text>
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
                        onRemovePhoto={index => {
                            setPhotos(prev => prev.filter((_, i) => i !== index));
                        }}
                    />
                </View>

                {/* アレルギーメモ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚠️ アレルギー反応メモ</Text>
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={allergyMemo}
                        onChangeText={setAllergyMemo}
                        placeholder="アレルギー反応があれば記録..."
                        placeholderTextColor="#CCC"
                        multiline
                        maxLength={MAX_MEMO_LENGTH}
                    />
                </View>

                {/* メモ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📝 メモ</Text>
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={note}
                        onChangeText={setNote}
                        placeholder="メモを入力..."
                        placeholderTextColor="#CCC"
                        multiline
                        maxLength={MAX_MEMO_LENGTH}
                    />
                </View>

                {/* ボタン */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSaving ? '保存中...' : '保存する'}
                        </Text>
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
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 60,
    },
    section: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
    },
    textInput: {
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: 4,
    },
    activeChip: {
        backgroundColor: '#FF8C94',
        borderColor: '#FF8C94',
    },
    chipIcon: {
        fontSize: 16,
    },
    chipText: {
        fontSize: 13,
        color: '#555',
        fontWeight: '600',
    },
    activeChipText: {
        color: '#FFF',
    },
    selectFoodButton: {
        backgroundColor: '#FF8C94',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    selectFoodButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    },
    placeholder: {
        fontSize: 14,
        color: '#CCC',
        textAlign: 'center',
        paddingVertical: 20,
    },
    foodCard: {
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    foodCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    foodCardName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    removeFoodText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '700',
        padding: 4,
    },
    foodCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 8,
    },
    foodCardLabel: {
        fontSize: 13,
        color: '#666',
        width: 36,
    },
    miniChipRow: {
        flexDirection: 'row',
        gap: 6,
    },
    miniChip: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    activeMiniChip: {
        backgroundColor: '#FF8C94',
    },
    miniChipText: {
        fontSize: 12,
        color: '#666',
    },
    activeMiniChipText: {
        color: '#FFF',
        fontWeight: '600',
    },
    buttonSection: {
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 40,
        gap: 12,
    },
    saveButton: {
        backgroundColor: '#FF8C94',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#FF8C94',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },
    deleteButton: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    deleteButtonText: {
        color: '#FF3B30',
        fontSize: 15,
        fontWeight: '600',
    },
    foodSelectorHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E0E0E0',
    },
    foodSelectorDone: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF8C94',
    },
});
