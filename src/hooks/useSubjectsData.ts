import { useEffect, useState } from "react";
import { fetchCSV } from "../services/fetchCSV";
import { getStorage, setStorage } from "../utils/storage";
import type { NestedRecord } from "../types/type";

// ← 実際に公開したスプレッドシートのCSV公開URLに差し替えてください
const SUBJECTS_ROOMS_MAP_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSizltFHoOWYdi97m2q_x21-XHwaeeMTzbUk0jlWCZRAD-CmsGn9uKZQMe2rHbIxP7_pEekWK84yf9/pub?gid=1007938727&single=true&output=csv";

type SubjectsRoomsDict = Record<string, string>; // electives -> name
type ExpansionMap = Record<string, string[]>;     // origin -> electives[]

type SubjectsData = {
    expansionMap: ExpansionMap | null;
    subjectsRoomsMap: SubjectsRoomsDict | null;
};

function parseRows(rows: NestedRecord[]): SubjectsData {
    const expansionMap: ExpansionMap = {};
    const subjectsRoomsMap: SubjectsRoomsDict = {};

    rows.forEach((row) => {
        const origin = typeof row.origin === "string" ? row.origin.trim() : "";
        const electives = typeof row.electives === "string" ? row.electives.trim() : "";
        const name = typeof row.name === "string" ? row.name.trim() : "";

        if (!electives) return;

        if (name) {
            subjectsRoomsMap[electives] = name;
        }

        if (!origin) return;

        if (!expansionMap[origin]) {
            expansionMap[origin] = [];
        }

        if (!expansionMap[origin].includes(electives)) {
            expansionMap[origin].push(electives);
        }
    });

    return { expansionMap, subjectsRoomsMap };
}

export function useSubjectsData() {
    const [data, setData] = useState<SubjectsData>({
        expansionMap: null,
        subjectsRoomsMap: null,
    });

    useEffect(() => {
        const CACHE_KEY = "subjectsData";

        const load = async () => {
            const cached = getStorage<SubjectsData>(CACHE_KEY);
            if (cached) {
                setData(cached);
            }

            try {
                const rows = await fetchCSV(SUBJECTS_ROOMS_MAP_URL);
                const parsed = parseRows(rows);

                setData(parsed);
                setStorage(CACHE_KEY, parsed);
            } catch (e) {
                console.error("選択科目・教室表の読み込みに失敗しました", e);

                if (!getStorage<SubjectsData>(CACHE_KEY)) {
                    setData({ expansionMap: {}, subjectsRoomsMap: {} });
                }
            }
        };

        load();
    }, []);

    return data;
}