import { useEffect, useState } from "react";
import { fetchJSON } from "../services/fetchJSON";

const base = import.meta.env.BASE_URL;

type StaticData = {
    events: any;
    holidays: any;
    expansionMap: any;
    subjectsRoomsMap: any;
    teacherMap: any;
    loading: boolean;
    error: string | null;
};

export function useStaticData() {
    const [state, setState] = useState<StaticData>({
        events: null,
        holidays: null,
        expansionMap: null,
        subjectsRoomsMap: null,
        teacherMap: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [
                    events,
                    holidays,
                    expansionMap,
                    subjectsRoomsMap,
                    teacherMap,
                ] = await Promise.all([
                    fetchJSON(`${base}/data/events.json`),
                    fetchJSON(`${base}/data/holidays.json`),
                    fetchJSON(`${base}/data/expansion_map.json`),
                    fetchJSON(`${base}/data/subjects_rooms_map.json`),
                    fetchJSON(`${base}/data/teacher.json`),
                ]);

                setState({
                    events,
                    holidays,
                    expansionMap,
                    subjectsRoomsMap,
                    teacherMap,
                    loading: false,
                    error: null,
                });
            } catch (e) {
                console.error(e);

                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: String(e),
                }));
            }
        };

        load();
    }, []);

    return state;
}
