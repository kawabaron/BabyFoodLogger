import { v4 as uuidv4 } from 'uuid';

/** UUID v4 を生成 */
export function generateId(): string {
    return uuidv4();
}
