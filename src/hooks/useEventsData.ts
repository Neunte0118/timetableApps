import { useCachedCSV } from "./useCachedCSV";
import type { NestedRecord } from "../types/type";

// ← 実際に公開したスプレッドシートのCSV公開URLに差し替えてください
const EVENTS_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSizltFHoOWYdi97m2q_x21-XHwaeeMTzbUk0jlWCZRAD-CmsGn9uKZQMe2rHbIxP7_pEekWK84yf9/pub?gid=1047451506&single=true&output=csv";

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
