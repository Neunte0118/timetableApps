import { useCachedCSV } from "./useCachedCSV";
import type { NestedRecord, SubjectsData } from "../types/type";
import { SUBJECTS_ROOMS_MAP_URL } from "@/config/url";

function parseRows(rows: NestedRecord[]): SubjectsData {
    const expansionMap: Record<string, string[]> = {};
    const subjectsRoomsMap: Record<string, string> = {};

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

export function useSubjectsData(): SubjectsData {
    const data = useCachedCSV<SubjectsData>({
        cacheKey: "subjectsData",
        url: SUBJECTS_ROOMS_MAP_URL,
        parse: parseRows,
        fallback: () => ({ expansionMap: {}, subjectsRoomsMap: {} }),
        errorLabel: "選択科目・教室表の読み込みに失敗しました",
    });

    return data ?? { expansionMap: null, subjectsRoomsMap: null };
}
