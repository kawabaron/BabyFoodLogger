import * as Crypto from 'expo-crypto';

/** UUID v4 を生成 */
export function generateId(): string {
    return Crypto.randomUUID();
}
