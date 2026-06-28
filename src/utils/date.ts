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
