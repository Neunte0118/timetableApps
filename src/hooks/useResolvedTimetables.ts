import { useMemo } from "react";
import type { ClassTimetableData, Weekday } from "../types/type";
import { isLaterSemester } from "../utils/date";

type ParsedCode = {
    type: string;
    weekday: Weekday;
    index: number;
};

const isWeekday = (v: string): v is Weekday =>
    v === "月" || v === "火" || v === "水" || v === "木" || v === "金" || v === "土";

export function parsePatternCode(code: string): ParsedCode | null {
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

export function resolveCode(
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
    earlierClassPatternData: Record<number, ClassTimetableData> | null | undefined,
    laterClassPatternData: Record<number, ClassTimetableData> | null | undefined,
    datePatternMap: Record<string, string[]> | null | undefined
): Record<number, Record<string, string[]>> {
    return useMemo(() => {
        if (!datePatternMap || (!earlierClassPatternData && !laterClassPatternData)) return {};

        const result: Record<number, Record<string, string[]>> = {};

        const allClassNos = Array.from(
            new Set([
                ...Object.keys(earlierClassPatternData ?? {}).map(Number),
                ...Object.keys(laterClassPatternData ?? {}).map(Number),
            ])
        );

        allClassNos.forEach((classNo) => {
            const earlierClass = earlierClassPatternData?.[classNo];
            const laterClass = laterClassPatternData?.[classNo] ?? earlierClass;
            const resolvedForClass: Record<string, string[]> = {};

            Object.entries(datePatternMap).forEach(([dateKey, codes]) => {
                const isLater = isLaterSemester(dateKey);
                const classData = (isLater ? laterClass : earlierClass) ?? earlierClass ?? laterClass;

                resolvedForClass[dateKey] = (codes ?? []).map((code) =>
                    resolveCode(code, classData)
                );
            });

            result[classNo] = resolvedForClass;
        });

        return result;
    }, [earlierClassPatternData, laterClassPatternData, datePatternMap]);
}