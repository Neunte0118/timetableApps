import { useCachedCSV } from "./useCachedCSV";
import type { NestedRecord } from "../types/type";
import { EVENTS_URL } from "@/config/url";

function parseRows(rows: NestedRecord[]): Record<string, string> {
    const result: Record<string, string> = {};

    rows.forEach((row) => {
        const date = typeof row.dates === "string" ? row.dates.trim() : "";
        const events = typeof row.events === "string" ? row.events.trim() : "";

        if (!date) return;

        result[date] = events;
    });

    return result;
}

export function useEventsData() {
    return useCachedCSV<Record<string, string>>({
        cacheKey: "events",
        url: EVENTS_URL,
        parse: parseRows,
        fallback: () => ({}),
        errorLabel: "行事予定の読み込みに失敗しました",
    });
}
