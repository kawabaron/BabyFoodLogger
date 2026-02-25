import { File, Paths } from 'expo-file-system';
import React, { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { exportAllData } from '../src/repositories/mealRecordRepository';

export default function SettingsScreen() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = await exportAllData();
            const backupFile = new File(Paths.document, 'babyfood_backup.json');
            backupFile.write(data);
            const path = backupFile.uri;
            await Share.share({
                url: path,
                title: 'Baby Food Logger バックアップ',
            });
        } catch (error) {
            Alert.alert('エラー', 'エクスポートに失敗しました');
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* データバックアップ */}
            <Text style={styles.sectionTitle}>💾 データ管理</Text>
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleExport}
                    disabled={isExporting}
                >
                    <Text style={styles.menuIcon}>📤</Text>
                    <View style={styles.menuInfo}>
                        <Text style={styles.menuTitle}>データをエクスポート</Text>
                        <Text style={styles.menuDesc}>JSON形式でバックアップを作成します</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 家族共有 */}
            <Text style={styles.sectionTitle}>👨‍👩‍👧 家族共有</Text>
            <View style={styles.card}>
                <View style={styles.comingSoonBanner}>
                    <Text style={styles.comingSoonIcon}>🚧</Text>
                    <Text style={styles.comingSoonTitle}>家族共有は今後対応予定</Text>
                    <Text style={styles.comingSoonDesc}>
                        現在は同一端末で利用する設計です。{'\n'}
                        将来のアップデートで家族間のデータ共有に対応予定です。
                    </Text>
                </View>
            </View>

            {/* 注意事項 */}
            <Text style={styles.sectionTitle}>📋 注意事項</Text>
            <View style={styles.card}>
                <View style={styles.noticeItem}>
                    <Text style={styles.noticeIcon}>⚕️</Text>
                    <Text style={styles.noticeText}>
                        このアプリは離乳食の記録を目的としたものです。
                        医療的な判断の代替にはなりません。
                        アレルギーなどの心配がある場合は、必ず医師にご相談ください。
                    </Text>
                </View>
                <View style={styles.noticeItem}>
                    <Text style={styles.noticeIcon}>📱</Text>
                    <Text style={styles.noticeText}>
                        データはすべて端末内に保存されています。
                        アプリを削除するとデータも消えますので、
                        定期的なバックアップをおすすめします。
                    </Text>
                </View>
            </View>

            {/* アプリ情報 */}
            <Text style={styles.sectionTitle}>ℹ️ アプリ情報</Text>
            <View style={styles.card}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>アプリ名</Text>
                    <Text style={styles.infoValue}>Baby Food Logger</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>バージョン</Text>
                    <Text style={styles.infoValue}>1.0.0 (MVP)</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    content: { padding: 16, paddingBottom: 40 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 10, marginTop: 16 },
    card: {
        backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', marginBottom: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
    },
    menuIcon: { fontSize: 24 },
    menuInfo: { flex: 1 },
    menuTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
    menuDesc: { fontSize: 12, color: '#999', marginTop: 2 },
    comingSoonBanner: {
        padding: 20, alignItems: 'center',
    },
    comingSoonIcon: { fontSize: 40, marginBottom: 12 },
    comingSoonTitle: { fontSize: 16, fontWeight: '700', color: '#FF8C94', marginBottom: 8 },
    comingSoonDesc: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20 },
    noticeItem: {
        flexDirection: 'row', padding: 14, gap: 10,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0',
    },
    noticeIcon: { fontSize: 20 },
    noticeText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 20 },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between', padding: 14,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0',
    },
    infoLabel: { fontSize: 14, color: '#666' },
    infoValue: { fontSize: 14, color: '#333', fontWeight: '600' },
});
