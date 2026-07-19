import { useEffect, useState } from "react";
import { fetchCSV } from "../services/fetchCSV";
import { getStorage, setStorage } from "../utils/storage";
import type { NestedRecord } from "../types/type";

// ← 実際に公開したスプレッドシートのCSV公開URLに差し替えてください
const HOLIDAYS_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSizltFHoOWYdi97m2q_x21-XHwaeeMTzbUk0jlWCZRAD-CmsGn9uKZQMe2rHbIxP7_pEekWK84yf9/pub?gid=652046519&single=true&output=csv";

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
    const [holidays, setHolidays] = useState<Record<string, string> | null>(null);

    useEffect(() => {
        const CACHE_KEY = "holidays";

        const load = async () => {
            const cached = getStorage<Record<string, string>>(CACHE_KEY);
            if (cached) {
                setHolidays(cached);
            }

            try {
                const rows = await fetchCSV(HOLIDAYS_URL);
                const parsed = parseRows(rows);

                setHolidays(parsed);
                setStorage(CACHE_KEY, parsed);
            } catch (e) {
                console.error("祝日情報の読み込みに失敗しました", e);

                if (!getStorage<Record<string, string>>(CACHE_KEY)) {
                    setHolidays({});
                }
            }
        };

        load();
    }, []);

    return holidays;
}