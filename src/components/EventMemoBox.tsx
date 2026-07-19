import "./EventMemoBox.css";

import { useEffect, useMemo, useState } from "react";
import { openDB, putData, getData, deleteData } from "../utils/indexedDB";
import { formatMonthDayJa, formatMonthDaySlash } from "../utils/date";
import { useCachedCSV } from "../hooks/useCachedCSV";
import { escapeHtmlWithoutWhiteList } from "../utils/escapeHtml";
import type { NestedRecord } from "../types/type";

const EXTRA_EVENT_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1dN6poNIpBsmis-JO2N2Hjiu96bkMuqs2fDtf1V3FH6iBs3BuQZVskaDq8n-xhoKEMdGYD-P5LscW/pub?gid=0&single=true&output=csv";

// CSSカラー値として許容する形式のみを通す（style属性へのインジェクション対策）
const SAFE_COLOR_PATTERN = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+|rgba?\([\d.,%\s]+\))$/;

const isSafeColor = (value: string): boolean => SAFE_COLOR_PATTERN.test(value.trim());

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

function parseExtraEventRows(rows: NestedRecord[]): ExtraEventRow[] {
    return rows.map((row) => ({
        dates: typeof row.dates === "string" ? row.dates : "",
        contents: typeof row.contents === "string" ? row.contents : "",
        light_color: typeof row.light_color === "string" ? row.light_color : undefined,
        dark_color: typeof row.dark_color === "string" ? row.dark_color : undefined,
    }));
}

export default function EventMemoBox({ theme, dayKey, plannedEvents }: Props) {
    const dayKeyJa = useMemo(() => formatMonthDayJa(dayKey), [dayKey]);
    const dayKeySlash = useMemo(() => formatMonthDaySlash(dayKey), [dayKey]);
    const memoStorageKey = dayKeySlash;

    const [db, setDb] = useState<IDBDatabase | null>(null);
    const [memo, setMemo] = useState("");

    const extraEvents = useCachedCSV<ExtraEventRow[]>({
        cacheKey: "extraEvents",
        url: EXTRA_EVENT_URL,
        parse: parseExtraEventRows,
        fallback: () => [],
        errorLabel: "追加行事の読み込みに失敗しました",
    });

    // IndexedDB 初期化
    useEffect(() => {
        openDB("TimetableDB", 2, (db) => {
            if (!db.objectStoreNames.contains("memos")) {
                db.createObjectStore("memos", { keyPath: "date" });
            }
        }).then(setDb);
    }, []);

    // メモ読み込み
    useEffect(() => {
        if (!db) return;

        getData<MemoData>(db, "memos", memoStorageKey)
            .then((data) => setMemo(data?.text ?? ""))
            .catch(() => setMemo(""));
    }, [db, memoStorageKey]);

    // メモ保存（デバウンス）
    useEffect(() => {
        if (!db) return;

        const id = window.setTimeout(() => {
            const trimmed = memo.trim();

            if (trimmed === "") {
                deleteData(db, "memos", memoStorageKey);
                return;
            }

            putData<MemoData>(db, "memos", {
                date: memoStorageKey,
                text: memo,
            });
        }, 300);

        return () => window.clearTimeout(id);
    }, [db, memo, memoStorageKey]);

    const eventLines = useMemo(() => {
        const lines: string[] = [];

        const planned = (plannedEvents?.[dayKeyJa] ?? "").trim();
        if (planned) {
            lines.push(escapeHtmlWithoutWhiteList(planned));
        }

        const extras = (extraEvents ?? []).filter((row) => row.dates === dayKeyJa);

        extras.forEach((row) => {
            const rawColor = theme === "light" ? row.light_color : row.dark_color;
            const safeContents = escapeHtmlWithoutWhiteList(row.contents);

            if (rawColor && isSafeColor(rawColor)) {
                lines.push(`<span style="color:${rawColor}">${safeContents}</span>`);
            } else {
                lines.push(safeContents);
            }
        });

        return lines;
    }, [plannedEvents, dayKeyJa, extraEvents, theme]);

    const eventHtml = useMemo(() => {
        if (eventLines.length === 0) return "";
        return eventLines.join("<br />");
    }, [eventLines]);

    return (
        <div className="event-memo-box">
            <div className="label">行事</div>

            <div className="event-cell">
                {extraEvents === null && <div className="muted">読み込み中…</div>}

                {eventHtml ? (
                    <div className="event-html" dangerouslySetInnerHTML={{ __html: eventHtml }} />
                ) : (
                    extraEvents !== null && <div className="muted">なし</div>
                )}
            </div>

            <div className="label">メモ</div>

            <textarea
                className="memo-input"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモを入力…"
                style={{ resize: "none" }}
            />
        </div>
    );
}
