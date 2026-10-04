import { useCachedCSV } from "./useCachedCSV";
import type { NestedRecord, ClassTimetableData, Weekday } from "../types/type";
import { CLASS_PATTERN_URL, LATER_CLASS_PATTERN_URL } from "@/config/url";

const PERIOD_KEYS = [
    "first_period",
    "second_period",
    "third_period",
    "fourth_period",
    "fifth_period",
    "sixth_period",
    "seventh_period",
    "eighth_period",
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

        // 5限以上（6限、7限...）が追加されても動的に反映
        let maxIndex = 4; // 少なくとも1〜5限
        for (let i = 5; i < PERIOD_KEYS.length; i++) {
            if (Object.prototype.hasOwnProperty.call(row, PERIOD_KEYS[i])) {
                maxIndex = i;
            }
        }
        const columns = PERIOD_KEYS.slice(0, maxIndex + 1);

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
        errorLabel: "前期時間割パターン表の読み込みに失敗しました",
    });
}

export function useLaterClassPatternData() {
    return useCachedCSV<Record<number, ClassTimetableData>>({
        cacheKey: "laterClassPatternData",
        url: LATER_CLASS_PATTERN_URL,
        parse: parseRows,
        fallback: () => ({}),
        errorLabel: "後期時間割パターン表の読み込みに失敗しました",
    });
}
