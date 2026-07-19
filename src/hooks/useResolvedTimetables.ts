import { useMemo } from "react";
import type { ClassTimetableData, Weekday } from "../types/type";

type ParsedCode = {
  week: "A" | "B" | "C";
  weekday: Weekday;
  index: number
};

function parsePatternCode(code: string): ParsedCode | null {
    if (!code) return null;

    const match = code.match(/^([ABC])([月火水木金土])(\d+)$/);
    if (!match) return null;

    const [, week, weekday, numStr] = match;
    const index = Number(numStr);
    if (!Number.isFinite(index) || index < 1) return null;

    return {
        week: week as "A" | "B" | "C",
        weekday: weekday as Weekday,
        index,
    };
}

function resolveCode(
    code: string,
    classData: ClassTimetableData | undefined
): string {
    if (!classData || !code) return "";

    const parsed = parsePatternCode(code);
    if (!parsed) {
        console.warn(`不正なパターンコード: ${code}`);
        return code;
    }

    return classData[parsed.week]?.[parsed.weekday]?.[parsed.index - 1] ?? "";
}

export function useResolvedTimetables(
    rawTimetables: Record<number, ClassTimetableData>,
    datePatternMap: Record<string, string[]> | null | undefined
): Record<number, Record<string, string[]>> {
    return useMemo(() => {
        if (!datePatternMap) return {};

        const result: Record<number, Record<string, string[]>> = {};

        Object.entries(rawTimetables).forEach(([classNoStr, classData]) => {
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
    }, [rawTimetables, datePatternMap]);
}