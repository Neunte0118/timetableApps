export function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

export function formatMonthDayJa(date: Date): string {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatMonthDaySlash(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function daysInMonth(year: number, monthIndex: number): number {
    return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * "7月1日" や "7/1" などの文字列を Date オブジェクトに変換
 */
export function parseMonthDayString(str: string, referenceDate: Date = new Date()): Date | null {
    const match = str.trim().match(/^(\d{1,2})[月/](\d{1,2})日?$/);
    if (!match) return null;

    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const currentYear = referenceDate.getFullYear();
    const currentMonth = referenceDate.getMonth() + 1;

    // 学年度や近傍の年判定（4月始まりの学校年度または最も近い年）
    let year = currentYear;
    // もし referenceDate が 9月で、対象が 1月や2月の場合、学年度では翌年
    if (currentMonth >= 4 && month < 4) {
        year = currentYear + 1;
    } else if (currentMonth < 4 && month >= 4) {
        year = currentYear - 1;
    }

    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

/**
 * 2つの日付の日数差 (a - b) を整数で返す
 */
export function diffInDays(a: Date, b: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((utcA - utcB) / msPerDay);
}

/**
 * 様々な日付表現（"10月5日", "10/5", "10-5", "2026/10/05" 等）を "10月5日" 形式に正規化する
 */
export function normalizeDateKey(dateStr: string): string {
    if (!dateStr) return "";
    const trimmed = dateStr.trim();
    if (/^\d{1,2}月\d{1,2}日$/.test(trimmed)) {
        return trimmed;
    }
    const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})$/);
    if (slashMatch) {
        return `${parseInt(slashMatch[1], 10)}月${parseInt(slashMatch[2], 10)}日`;
    }
    const fullMatch = trimmed.match(/^\d{4}[/-](\d{1,2})[/-](\d{1,2})$/);
    if (fullMatch) {
        return `${parseInt(fullMatch[1], 10)}月${parseInt(fullMatch[2], 10)}日`;
    }
    const d = parseMonthDayString(trimmed);
    return d ? formatMonthDayJa(d) : trimmed;
}

/**
 * 10月6日以降（後期時間割適用期間）であるかを判定する。
 * 日本の学校年度（4月〜翌年3月）において、10月6日〜3月31日を後期とする。
 */
export function isLaterSemester(dateOrDateKey: Date | string): boolean {
    if (!dateOrDateKey) return false;

    if (typeof dateOrDateKey === "string") {
        const normalized = normalizeDateKey(dateOrDateKey);
        const match = normalized.match(/^(\d{1,2})月(\d{1,2})日$/);
        if (match) {
            const m = parseInt(match[1], 10);
            const d = parseInt(match[2], 10);
            if (m === 10) return d >= 6;
            if (m > 10 || m <= 3) return true;
            return false;
        }
    }

    const date = typeof dateOrDateKey === "string" ? parseMonthDayString(dateOrDateKey) : dateOrDateKey;
    if (!date) return false;
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (month === 10) {
        return day >= 6;
    }
    if (month > 10 || month <= 3) {
        return true;
    }
    return false;
}
