import dayjs from 'dayjs';

/** 今日の日付を YYYY-MM-DD 形式で取得 */
export function getToday(): string {
    return dayjs().format('YYYY-MM-DD');
}

/** 今月を YYYY-MM 形式で取得 */
export function getCurrentMonth(): string {
    return dayjs().format('YYYY-MM');
}

/** 日付文字列から年月を取得 */
export function getMonthFromDate(date: string): string {
    return date.substring(0, 7); // YYYY-MM
}

/** 指定月の日数を取得 */
export function getDaysInMonth(month: string): number {
    return dayjs(month + '-01').daysInMonth();
}

/** 指定月の1日の曜日（0=日, 6=土）を取得 */
export function getFirstDayOfWeek(month: string): number {
    return dayjs(month + '-01').day();
}

/** 指定月の前月を取得 */
export function getPrevMonth(month: string): string {
    return dayjs(month + '-01').subtract(1, 'month').format('YYYY-MM');
}

/** 指定月の次月を取得 */
export function getNextMonth(month: string): string {
    return dayjs(month + '-01').add(1, 'month').format('YYYY-MM');
}

/** 日付を表示用にフォーマット（例: 2026/02/25） */
export function formatDateDisplay(date: string): string {
    return dayjs(date).format('YYYY/MM/DD');
}

/** 月を表示用にフォーマット（例: 2026年2月） */
export function formatMonthDisplay(month: string): string {
    const d = dayjs(month + '-01');
    return `${d.year()}年${d.month() + 1}月`;
}

/** 曜日ラベル */
export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

/** 現在時刻を HH:mm 形式で取得 */
export function getCurrentTime(): string {
    return dayjs().format('HH:mm');
}

/** ISO 8601 形式のタイムスタンプを取得 */
export function getNow(): string {
    return dayjs().toISOString();
}
