import "./Toolbar.css";
import { useEffect, useState } from "react";
import type { tableModeType } from "../types/type";

type Props = {
    tableMode: tableModeType;
    toggleTableMode: () => void;
    setIsSearchOpen: () => void;
};

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const TABLE_MODE_LABELS: Record<tableModeType, string> = {
    subjects: "時間割",
    rooms: "移動教室",
    teachers: "先生",
};

function formatNow(d: Date): string {
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = DAY_LABELS[d.getDay()];
    const hour = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${month}/${date}(${day}) ${hour}:${minutes}`;
}

export default function Toolbar({ tableMode, toggleTableMode, setIsSearchOpen }: Props) {
    const [now, setNow] = useState(() => formatNow(new Date()));

    // 表示中の現在時刻を1分ごとに更新する
    useEffect(() => {
        const id = window.setInterval(() => {
            setNow(formatNow(new Date()));
        }, 60_000);

        return () => window.clearInterval(id);
    }, []);

    return (
        <div className="toolbar">
            <button className="toggle-moving-mode" onClick={toggleTableMode}>
                {TABLE_MODE_LABELS[tableMode]}
            </button>

            <div className="now">{now}</div>

            <button className="search" onClick={setIsSearchOpen}>
                検索
            </button>
        </div>
    );
}
