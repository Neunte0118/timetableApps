import { useCachedCSV } from "./useCachedCSV";
import type { NestedRecord, ClassTimetableData, Weekday } from "../types/type";

// ← 実際に公開したスプレッドシートのCSV公開URLに差し替えてください
const CLASS_PATTERN_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSizltFHoOWYdi97m2q_x21-XHwaeeMTzbUk0jlWCZRAD-CmsGn9uKZQMe2rHbIxP7_pEekWK84yf9/pub?gid=886789577&single=true&output=csv";

const PERIOD_COLUMNS = [
    "first_period",
    "second_period",
    "third_period",
    "fourth_period",
    "fifth_period",
    "sixth_period",
];

const isWeekday = (v: string): v is Weekday =>
    v === "月" || v === "火" || v === "水" || v === "木" || v === "金" || v === "土";

function parseRows(rows: NestedRecord[]): Record<number, ClassTimetableData> {
    const result: Record<number, ClassTimetableData> = {};

    rows.forEach((row) => {
        const classNo = Number(row.class);
        const type = typeof row.type === "string" ? row.type.trim() : "";
        const dayRaw = typeof row.day_of_week === "string" ? row.day_of_week.trim() : "";

        if (!Number.isFinite(classNo) || !type || !isWeekday(dayRaw)) return;

        const hasSixth = Object.prototype.hasOwnProperty.call(row, "sixth_period");
        const columns = hasSixth ? PERIOD_COLUMNS : PERIOD_COLUMNS.slice(0, 5);

        const subjects = columns.map((key) =>
            typeof row[key] === "string" ? (row[key] as string).trim() : ""
        );

        if (!result[classNo]) result[classNo] = {};
        if (!result[classNo][type]) result[classNo][type] = {};

        result[classNo][type][dayRaw] = subjects;
    });

    return result;
}

export function useClassPatternData() {
    return useCachedCSV<Record<number, ClassTimetableData>>({
        cacheKey: "classPatternData",
        url: CLASS_PATTERN_URL,
        parse: parseRows,
        fallback: () => ({}),
        errorLabel: "時間割パターン表の読み込みに失敗しました",
    });
}
