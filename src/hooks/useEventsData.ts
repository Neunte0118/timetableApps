import { useEffect, useState } from "react";
import { fetchCSV } from "../services/fetchCSV";
import { getStorage, setStorage } from "../utils/storage";
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
    const [events, setEvents] = useState<Record<string, string> | null>(null);

    useEffect(() => {
        const CACHE_KEY = "events";

        const load = async () => {
            const cached = getStorage<Record<string, string>>(CACHE_KEY);
            if (cached) {
                setEvents(cached);
            }

            try {
                const rows = await fetchCSV(EVENTS_URL);
                const parsed = parseRows(rows);

                setEvents(parsed);
                setStorage(CACHE_KEY, parsed);
            } catch (e) {
                console.error("行事予定の読み込みに失敗しました", e);

                if (!getStorage<Record<string, string>>(CACHE_KEY)) {
                    setEvents({});
                }
            }
        };

        load();
    }, []);

    return events;
}