import "./EventMemoBox.css";

import { useEffect, useMemo, useState } from "react";
import { fetchCSV } from "../services/fetchCSV";
import {
    openDB,
    putData,
    getData,
    deleteData,
} from "../utils/indexedDB";
import { getStorage, setStorage } from "@/utils/storage";
import { formatMonthDayJa, formatMonthDaySlash } from "../utils/date";

type ExtraEventRow = {
    dates: string;
    contents: string;
    light_color?: string;
    dark_color?: string;
};

type MemoData = {
    date: string;
    text: string;
};

type Props = {
    theme: "light" | "dark";
    dayKey: Date;
    plannedEvents: Record<string, string>;
};

export default function EventMemoBox({
    theme,
    dayKey,
    plannedEvents,
}: Props) {
    const EXTRA_EVENT_URL =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1dN6poNIpBsmis-JO2N2Hjiu96bkMuqs2fDtf1V3FH6iBs3BuQZVskaDq8n-xhoKEMdGYD-P5LscW/pub?gid=0&single=true&output=csv";

    
    const dayKeyJa = useMemo(() => formatMonthDayJa(dayKey), [dayKey]);
    const dayKeySlash = useMemo(() => formatMonthDaySlash(dayKey), [dayKey]);

    const memoStorageKey = useMemo(
        () => `${dayKeySlash}`,
        [dayKeySlash]
    );

    const [db, setDb] = useState<IDBDatabase | null>(null);

    const [extraEvents, setExtraEvents] =
        useState<ExtraEventRow[] | null>(null);

    const [extraError, setExtraError] =
        useState<string | null>(null);

    const [memo, setMemo] = useState("");

    // IndexedDB 初期化
    useEffect(() => {
        openDB("TimetableDB", 2, (db) => {
            if (!db.objectStoreNames.contains("memos")) {
                db.createObjectStore("memos", {
                    keyPath: "date",
                });
            }
        }).then(setDb);
    }, []);

    // メモ読み込み
    useEffect(() => {
        if (!db) return;

        getData<MemoData>(db, "memos", memoStorageKey)
            .then((data) => {
                setMemo(data?.text ?? "");
            })
            .catch(() => {
                setMemo("");
            });
    }, [db, memoStorageKey]);

    // メモ保存
// メモ保存
    useEffect(() => {
        if (!db) return;

        const id = window.setTimeout(() => {
            const trimmed = memo.trim();

            // 空なら削除
            if (trimmed === "") {
                deleteData(db, "memos", memoStorageKey);
                return;
            }

            // 空でなければ保存
            putData<MemoData>(db, "memos", {
                date: memoStorageKey,
                text: memo,
            });
        }, 300);

        return () => window.clearTimeout(id);
    }, [db, memo, memoStorageKey]);

    // CSV取得
    useEffect(() => {
        const CACHE_KEY = "extraEvents";

        const load = async () => {
            // キャッシュを先に表示
            const cached = getStorage<ExtraEventRow[]>(CACHE_KEY);
            if (cached) {
                setExtraEvents(cached);
                setExtraError(null);
            }

            try {
                const data = await fetchCSV(EXTRA_EVENT_URL) as ExtraEventRow[];

                setExtraEvents(data);
                setExtraError(null);
                setStorage(CACHE_KEY, data);
            } catch {
                console.error("追加行事の読み込みに失敗しました");

                // キャッシュが無い場合だけエラー表示
                if (!cached) {
                    setExtraEvents([]);
                    setExtraError("追加行事の読み込みに失敗しました");
                }
            }
        };

        load();
    }, []);

    const eventLines = useMemo(() => {
        const lines: string[] = [];

        const planned =
            (plannedEvents?.[dayKeyJa] ?? "").trim();

        if (planned) {
            lines.push(planned);
        }

        const extras = (extraEvents ?? []).filter(
            (row) => row.dates === dayKeyJa
        );

        extras.forEach((row) => {
            const color =
                theme === "light"
                    ? row.light_color
                    : row.dark_color;

            if (color) {
                lines.push(
                    `<span style="color:${color}">${row.contents}</span>`
                );
            } else {
                lines.push(row.contents);
            }
        });

        return lines;
    }, [plannedEvents, dayKeyJa, extraEvents, theme]);

    const eventHtml = useMemo(() => {
        if (eventLines.length === 0) {
            return "";
        }

        return eventLines.join("<br />");
    }, [eventLines]);

    return (
        <div className="event-memo-box">
            <div className="label">行事</div>

            <div className="event-cell">
                {extraEvents === null && (
                    <div className="muted">
                        読み込み中…
                    </div>
                )}

                {extraError && (
                    <div className="muted">
                        {extraError}
                    </div>
                )}

                {eventHtml ? (
                    <div
                        className="event-html"
                        dangerouslySetInnerHTML={{
                            __html: eventHtml,
                        }}
                    />
                ) : (
                    <div className="muted">
                        なし
                    </div>
                )}
            </div>

            <div className="label">メモ</div>

            <textarea
                className="memo-input"
                value={memo}
                onChange={(e) =>
                    setMemo(e.target.value)
                }
                placeholder="メモを入力…"
            />
        </div>
    );
}