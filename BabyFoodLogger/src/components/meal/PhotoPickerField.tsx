import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MAX_PHOTOS } from '../../utils/constants';

interface PhotoPickerFieldProps {
    photos: Array<{ uri: string; id?: string }>;
    onAddPhoto: (uri: string) => void;
    onRemovePhoto: (index: number) => void;
}

export function PhotoPickerField({ photos, onAddPhoto, onRemovePhoto }: PhotoPickerFieldProps) {
    const handlePickImage = async () => {
        if (photos.length >= MAX_PHOTOS) {
            Alert.alert('上限に達しました', `写真は最大${MAX_PHOTOS}枚まで添付できます`);
            return;
        }

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('権限が必要です', '写真ライブラリへのアクセスを許可してください');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsMultipleSelection: false,
        });

        if (!result.canceled && result.assets.length > 0) {
            onAddPhoto(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.photosRow}>
                {photos.map((photo, index) => (
                    <View key={index} style={styles.photoWrapper}>
                        <Image source={{ uri: photo.uri }} style={styles.photo} />
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => onRemovePhoto(index)}
                        >
                            <Text style={styles.removeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {photos.length < MAX_PHOTOS && (
                    <TouchableOpacity style={styles.addPhotoButton} onPress={handlePickImage}>
                        <Text style={styles.addPhotoIcon}>📷</Text>
                        <Text style={styles.addPhotoText}>追加</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.hint}>最大{MAX_PHOTOS}枚</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 4,
    },
    photosRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    photoWrapper: {
        position: 'relative',
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    addPhotoButton: {
        width: 80,
        height: 80,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    addPhotoIcon: {
        fontSize: 24,
    },
    addPhotoText: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    hint: {
        fontSize: 11,
        color: '#999',
        marginTop: 6,
    },
});
