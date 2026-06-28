import { useState, useCallback } from "react";
import { fetchJSON } from "../services/fetchJSON";

const base = import.meta.env.BASE_URL;

export function useTimetables() {
    const [timetables, setTimetables] = useState<Record<number, any>>({});

    const loadTimetable = useCallback(async (classNo: number) => {
        const data = await fetchJSON(`${base}/data/timetable/timetable_class-${classNo}.json`);

        setTimetables(prev => ({
            ...prev,
            [classNo]: data,
        }));
    }, []);

    return { timetables, loadTimetable };
}
