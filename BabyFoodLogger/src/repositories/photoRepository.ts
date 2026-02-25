import { Directory, File, Paths } from 'expo-file-system';
import type { PhotoAsset } from '../types/domain';
import { getNow } from '../utils/date';
import { generateId } from '../utils/id';
import { getDatabase } from './database';

const PHOTO_DIR_NAME = 'photos';

function getPhotoDir(): Directory {
    return new Directory(Paths.document, PHOTO_DIR_NAME);
}

/** 写真をアプリ管理領域にコピーして保存 */
export async function savePhoto(sourceUri: string): Promise<PhotoAsset> {
    const photoDir = getPhotoDir();
    if (!photoDir.exists) {
        photoDir.create();
    }

    const db = await getDatabase();
    const id = generateId();
    const now = getNow();
    const ext = sourceUri.split('.').pop() || 'jpg';
    const destFile = new File(photoDir, `${id}.${ext}`);

    // sourceからコピー
    const sourceFile = new File(sourceUri);
    sourceFile.copy(destFile);

    const destUri = destFile.uri;

    const asset: PhotoAsset = {
        id,
        localUri: destUri,
        createdAt: now,
        updatedAt: now,
    };

    await db.runAsync(
        `INSERT INTO photo_assets (id, localUri, thumbnailUri, width, height, fileSize, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        id, destUri, null, null, null, null, now, now
    );

    return asset;
}

export async function getPhotosByIds(ids: string[]): Promise<PhotoAsset[]> {
    if (ids.length === 0) return [];
    const db = await getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    return db.getAllAsync<PhotoAsset>(
        `SELECT * FROM photo_assets WHERE id IN (${placeholders})`,
        ...ids
    );
}

export async function deletePhoto(id: string): Promise<void> {
    const db = await getDatabase();
    const photo = await db.getFirstAsync<PhotoAsset>(
        'SELECT * FROM photo_assets WHERE id = ?', id
    );
    if (photo) {
        try {
            const file = new File(photo.localUri);
            if (file.exists) {
                file.delete();
            }
        } catch {
            // ファイルが既に存在しない場合は無視
        }
        await db.runAsync('DELETE FROM photo_assets WHERE id = ?', id);
    }
}
