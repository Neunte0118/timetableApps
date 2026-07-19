import { useMemo } from "react";
import type { ClassTimetableData, Weekday } from "../types/type";

type ParsedCode = {
    type: string;
    weekday: Weekday;
    index: number;
};

const isWeekday = (v: string): v is Weekday =>
    v === "月" || v === "火" || v === "水" || v === "木" || v === "金" || v === "土";

function parsePatternCode(code: string): ParsedCode | null {
    if (!code) return null;

    const match = code.match(/^(.+?)([月火水木金土])(\d+)$/);
    if (!match) return null;

    const [, type, weekdayRaw, numStr] = match;

    if (!isWeekday(weekdayRaw)) return null;

    const index = Number(numStr);
    if (!Number.isInteger(index) || index < 1) return null;

    return {
        type,
        weekday: weekdayRaw,
        index,
    };
}

function resolveCode(
    code: string,
    classData: ClassTimetableData | undefined
): string {
    if (!classData || !code) return "";

    const parsed = parsePatternCode(code);

    // パターンでなければそのまま返す
    if (!parsed) return code;

    return classData[parsed.type]?.[parsed.weekday]?.[parsed.index - 1] ?? "";
}

export function useResolvedTimetables(
    classPatternData: Record<number, ClassTimetableData> | null | undefined,
    datePatternMap: Record<string, string[]> | null | undefined
): Record<number, Record<string, string[]>> {
    return useMemo(() => {
        if (!datePatternMap || !classPatternData) return {};

        const result: Record<number, Record<string, string[]>> = {};

        Object.entries(classPatternData).forEach(([classNoStr, classData]) => {
            const classNo = Number(classNoStr);
            const resolvedForClass: Record<string, string[]> = {};

            Object.entries(datePatternMap).forEach(([dateKey, codes]) => {
                resolvedForClass[dateKey] = (codes ?? []).map((code) =>
                    resolveCode(code, classData)
                );
            });

            result[classNo] = resolvedForClass;
        });

        return result;
    }, [classPatternData, datePatternMap]);
}