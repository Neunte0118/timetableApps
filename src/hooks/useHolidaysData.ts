import { useCachedCSV } from "./useCachedCSV";
import type { NestedRecord } from "../types/type";
import { HOLIDAYS_URL } from "@/config/url";

function parseRows(rows: NestedRecord[]): Record<string, string> {
    const result: Record<string, string> = {};

    rows.forEach((row) => {
        const date = typeof row.dates === "string" ? row.dates.trim() : "";
        const holidays = typeof row.holidays === "string" ? row.holidays.trim() : "";

        if (!date) return;

        result[date] = holidays;
    });

    return result;
}

export function useHolidaysData() {
    return useCachedCSV<Record<string, string>>({
        cacheKey: "holidays",
        url: HOLIDAYS_URL,
        parse: parseRows,
        fallback: () => ({}),
        errorLabel: "祝日情報の読み込みに失敗しました",
    });
}
