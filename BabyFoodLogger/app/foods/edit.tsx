import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert, KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { getDatabase } from '../../src/repositories/database';
import { useMasterStore } from '../../src/stores/masterStore';
import type { FoodCategory } from '../../src/types/domain';
import { FOOD_CATEGORY_ICONS, FOOD_CATEGORY_LABELS } from '../../src/utils/constants';
import { getNow } from '../../src/utils/date';
import { generateId } from '../../src/utils/id';

const CATEGORIES: FoodCategory[] = [
    'grain', 'vegetable', 'fruit', 'protein', 'dairy', 'seafood', 'dish', 'seasoning', 'other',
];

const ICON_OPTIONS = ['🍚', '🍞', '🍜', '🥔', '🍠', '🥕', '🥬', '🎃', '🥦', '🍅', '🧅', '🌽',
    '🍌', '🍎', '🍓', '🍑', '🍊', '🍇', '🥝', '🧊', '🥚', '🍗', '🥩', '🫘',
    '🥛', '🧀', '🧈', '🐟', '🦐', '🍲', '🧂', '🍬', '🫒', '🍳', '🥘', '🍱',
    '🍙', '🥗', '🍛', '🍝', '🥣', '🍽️', '🌿', '📦'];

export default function FoodEditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const isEditing = !!params.id;
    const loadMasters = useMasterStore(s => s.loadMasters);
    const getFoodByIdFn = useMasterStore(s => s.getFoodById);

    const [name, setName] = useState('');
    const [kana, setKana] = useState('');
    const [category, setCategory] = useState<FoodCategory>('other');
    const [iconKey, setIconKey] = useState('📦');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isEditing && params.id) {
            const food = getFoodByIdFn(params.id);
            if (food) {
                setName(food.name);
                setKana(food.kana || '');
                setCategory(food.category);
                setIconKey(food.iconKey);
            }
        }
    }, [params.id]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('入力エラー', '名前を入力してください');
            return;
        }

        setIsSaving(true);
        try {
            const db = await getDatabase();
            const now = getNow();

            if (isEditing && params.id) {
                await db.runAsync(
                    `UPDATE food_masters SET name = ?, kana = ?, category = ?, iconKey = ?, updatedAt = ? WHERE id = ?`,
                    name.trim(), kana.trim() || null, category, iconKey, now, params.id
                );
            } else {
                const id = generateId();
                await db.runAsync(
                    `INSERT INTO food_masters (id, name, kana, category, iconKey, isDefault, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
                    id, name.trim(), kana.trim() || null, category, iconKey, now, now
                );
            }

            await loadMasters();
            router.back();
        } catch (error) {
            Alert.alert('エラー', '保存に失敗しました');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* 名前 */}
                <View style={styles.section}>
                    <Text style={styles.label}>名前 *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="例：にんじん、肉じゃが"
                        placeholderTextColor="#CCC"
                        autoFocus={!isEditing}
                    />
                </View>

                {/* ふりがな */}
                <View style={styles.section}>
                    <Text style={styles.label}>ふりがな（任意）</Text>
                    <TextInput
                        style={styles.input}
                        value={kana}
                        onChangeText={setKana}
                        placeholder="にんじん"
                        placeholderTextColor="#CCC"
                    />
                </View>

                {/* カテゴリ */}
                <View style={styles.section}>
                    <Text style={styles.label}>カテゴリ</Text>
                    <View style={styles.chipRow}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, category === cat && styles.activeChip]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[styles.chipText, category === cat && styles.activeChipText]}>
                                    {FOOD_CATEGORY_ICONS[cat]} {FOOD_CATEGORY_LABELS[cat]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* アイコン */}
                <View style={styles.section}>
                    <Text style={styles.label}>アイコン</Text>
                    <View style={styles.iconGrid}>
                        {ICON_OPTIONS.map(icon => (
                            <TouchableOpacity
                                key={icon}
                                style={[styles.iconOption, iconKey === icon && styles.activeIconOption]}
                                onPress={() => setIconKey(icon)}
                            >
                                <Text style={styles.iconText}>{icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* プレビュー */}
                <View style={styles.previewSection}>
                    <Text style={styles.previewLabel}>プレビュー</Text>
                    <View style={styles.previewCard}>
                        <Text style={styles.previewIcon}>{iconKey}</Text>
                        <Text style={styles.previewName}>{name || '食材名'}</Text>
                    </View>
                </View>

                {/* 保存ボタン */}
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving ? '保存中...' : (isEditing ? '更新する' : '追加する')}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    section: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
    label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 },
    input: { backgroundColor: '#F8F8F8', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#E8E8E8' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#E0E0E0' },
    activeChip: { backgroundColor: '#FF8C94', borderColor: '#FF8C94' },
    chipText: { fontSize: 13, color: '#555', fontWeight: '600' },
    activeChipText: { color: '#FFF' },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    iconOption: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8E8' },
    activeIconOption: { backgroundColor: '#FFF0F3', borderColor: '#FF8C94', borderWidth: 2 },
    iconText: { fontSize: 22 },
    previewSection: { alignItems: 'center', paddingVertical: 16 },
    previewLabel: { fontSize: 12, color: '#999', marginBottom: 8 },
    previewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    previewIcon: { fontSize: 28 },
    previewName: { fontSize: 17, fontWeight: '600', color: '#333' },
    saveButton: { backgroundColor: '#FF8C94', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8, shadowColor: '#FF8C94', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    disabledButton: { opacity: 0.6 },
    saveButtonText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
});
