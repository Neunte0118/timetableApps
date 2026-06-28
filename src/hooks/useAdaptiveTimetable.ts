import { useEffect, useMemo } from "react";
import { tableModeType } from "../types/type";

type SubjectRoomMap = {
    origin: string;
    electives: string;
    rooms: string;
    name: string;
    teacher?: string;
};

type AdaptiveTimetable = Record<string, string[]>;

export default function useAdaptiveTimetable(
    classNumber: number,
    teacherMap: Record<string, string | string[]>,
    timetable: Record<string, string[]> | undefined,
    expansionMap: Record<string, string[]> | undefined,
    subjectChoices: Record<string, string>,
    subjectRoomsMap: SubjectRoomMap[],
    tableMode: tableModeType,
): AdaptiveTimetable {
    useEffect(() => {
        console.log("teacherMap", teacherMap);
        console.log("timetable", timetable);
        console.log("expansionMap", expansionMap);
        console.log("subjectRoomsMap", subjectRoomsMap);
    }), [];
    
    return useMemo(() => {
        if (!timetable || !expansionMap) {
            return timetable || {};
        }

        const resolved: AdaptiveTimetable = {};

        Object.entries(timetable).forEach(([date, subjects]) => {
            resolved[date] = subjects.map((code) => {
                if (!code) return "";

                const isExpandable = Boolean(expansionMap[code]);
                const subjectName = isExpandable ? (subjectChoices[code] ?? code) : code;

                if (tableMode === "subjects") {
                    return subjectName;
                }

                const mapping = subjectRoomsMap.find((item) => item.electives === subjectName);

                if (tableMode === "rooms") {
                    if (!isExpandable) { return `${classNumber}組教室` };
                    return mapping?.name ?? "?";
                }

                // teachers                
                if (tableMode === "teachers") {
                    const v = teacherMap?.[subjectName];

                    if (typeof v === "string") return v;

                    if (Array.isArray(v)) {
                        return v[classNumber] ?? "";
                    }

                    if (v && typeof v === "object") {
                        const obj = v as Record<string, unknown>;

                        if (typeof obj.teacher === "string") return obj.teacher;
                        if (typeof obj.name === "string") return obj.name;
                        if (typeof obj.value === "string") return obj.value;
                    }

                    return "";
                }

                return "";
            });
        });

        return resolved;
    }, [
        timetable,
        expansionMap,
        subjectChoices,
        subjectRoomsMap,
        tableMode,
        classNumber,
    ]);
}
