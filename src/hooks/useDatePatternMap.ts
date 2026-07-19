import { useEffect, useState } from "react";
import { fetchCSV } from "../services/fetchCSV";
import { getStorage, setStorage } from "../utils/storage";
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
    const [datePatternMap, setDatePatternMap] =
        useState<Record<string, string[]> | null>(null);

    useEffect(() => {
        const CACHE_KEY = "datePatternMap";

        const load = async () => {
            const cached = getStorage<Record<string, string[]>>(CACHE_KEY);
            if (cached) {
                setDatePatternMap(cached);
            }

            try {
                const rows = await fetchCSV(DATE_PATTERN_MAP_URL);
                const parsed = parseRows(rows);

                setDatePatternMap(parsed);
                setStorage(CACHE_KEY, parsed);
            } catch (e) {
                console.error("日付パターン表の読み込みに失敗しました", e);

                if (!getStorage<Record<string, string[]>>(CACHE_KEY)) {
                    setDatePatternMap({});
                }
            }
        };

        load();
    }, []);

    return datePatternMap;
}