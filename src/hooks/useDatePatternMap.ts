import { useCachedCSV } from "./useCachedCSV";
import type { NestedRecord } from "../types/type";

// ← 実際に公開したスプレッドシートのCSV公開URLに差し替えてください
const DATE_PATTERN_MAP_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSizltFHoOWYdi97m2q_x21-XHwaeeMTzbUk0jlWCZRAD-CmsGn9uKZQMe2rHbIxP7_pEekWK84yf9/pub?gid=598100052&single=true&output=csv";

const PERIOD_COLUMNS = [
    "first_period",
    "second_period",
    "third_period",
    "fourth_period",
    "fifth_period",
    "sixth_period", // 列が無いシートなら自動的に無視されます
];

function parseRows(rows: NestedRecord[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    rows.forEach((row) => {
        const date = typeof row.dates === "string" ? row.dates.trim() : "";
        if (!date) return;

        const hasSixth = Object.prototype.hasOwnProperty.call(row, "sixth_period");
        const columns = hasSixth ? PERIOD_COLUMNS : PERIOD_COLUMNS.slice(0, 5);

        result[date] = columns.map((key) =>
            typeof row[key] === "string" ? (row[key] as string).trim() : ""
        );
    });

    return result;
}

export function useDatePatternMap() {
    return useCachedCSV<Record<string, string[]>>({
        cacheKey: "datePatternMap",
        url: DATE_PATTERN_MAP_URL,
        parse: parseRows,
        fallback: () => ({}),
        errorLabel: "日付パターン表の読み込みに失敗しました",
    });
}
