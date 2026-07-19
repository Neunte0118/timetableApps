import { useEffect, useState } from "react";
import { fetchJSON } from "../services/fetchJSON";
import { logger } from "../utils/logger";
import type { TeacherMap } from "../types/type";

const log = logger.scope("useStaticData");
const base = import.meta.env.BASE_URL;

type StaticData = {
    teacherMap: TeacherMap | null;
    loading: boolean;
    error: string | null;
};

export function useStaticData() {
    const [state, setState] = useState<StaticData>({
        teacherMap: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [teacherMap] = await Promise.all([
                    fetchJSON<TeacherMap>(`${base}/data/teacher.json`),
                ]);

                if (cancelled) return;

                setState({
                    teacherMap,
                    loading: false,
                    error: null,
                });
            } catch (e) {
                log.error("teacher.json の読み込みに失敗しました", e);

                if (cancelled) return;

                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: String(e),
                }));
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
