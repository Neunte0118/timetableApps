import { useEffect, useState } from "react";
import { fetchJSON } from "../services/fetchJSON";

const base = import.meta.env.BASE_URL;

type StaticData = {
    teacherMap: any;
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
        const load = async () => {
            try {
                const [
                    teacherMap,
                ] = await Promise.all([
                    fetchJSON(`${base}/data/teacher.json`),
                ]);

                setState({
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