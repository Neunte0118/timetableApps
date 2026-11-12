import { useCachedCSV } from "./useCachedCSV";
import type { NestedRecord, SubjectsData } from "../types/type";
import { SUBJECTS_ROOMS_MAP_URL } from "@/config/url";
import { SATURDAY_LECTURES_MAP } from "../utils/saturdayLectures";

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

    // 土曜講習①〜④の選択科目をexpansionMapに組み込む
    Object.entries(SATURDAY_LECTURES_MAP).forEach(([origin, electives]) => {
        if (!expansionMap[origin]) {
            expansionMap[origin] = [...electives];
        } else {
            electives.forEach((e) => {
                if (!expansionMap[origin].includes(e)) {
                    expansionMap[origin].push(e);
                }
            });
        }
    });

    Object.keys(expansionMap).forEach((origin) => {
        expansionMap[origin].sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));
    });

    return { expansionMap, subjectsRoomsMap };
}

export function useSubjectsData(): SubjectsData {
    const data = useCachedCSV<SubjectsData>({
        cacheKey: "subjectsData",
        url: SUBJECTS_ROOMS_MAP_URL,
        parse: parseRows,
        fallback: () => ({ expansionMap: { ...SATURDAY_LECTURES_MAP }, subjectsRoomsMap: {} }),
        errorLabel: "選択科目・教室表の読み込みに失敗しました",
    });

    return data ?? { expansionMap: { ...SATURDAY_LECTURES_MAP }, subjectsRoomsMap: null };
}
