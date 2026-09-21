import { useEffect, useMemo, useState, ReactNode } from "react";
import Modal from "../Modal";
import type { ModalType, ExtraEventRow, MemoData } from "../../types/type";
import { openDB, getAllData } from "../../utils/indexedDB";
import { parseMonthDayString } from "../../utils/date";
import "./SearchModal.css";

type CategoryFilter = "memos" | "events";

type SearchItem = {
    id: string;
    type: "memo" | "event";
    typeLabel: string;
    dateKey: string;
    date: Date | null;
    title: string;
    snippet?: string;
};

type Props = ModalType & {
    currentDay?: Date;
    plannedEvents: Record<string, string>;
    extraEvents?: ExtraEventRow[];
    onSelectDate: (targetDate: Date) => void;
};

function stripHtmlTags(input: string): string {
    if (!input) return "";
    try {
        const doc = new DOMParser().parseFromString(input, "text/html");
        const text = doc.body.textContent || "";
        return text.trim();
    } catch {
        return input
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<[^>]+>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ")
            .trim();
    }
}

function highlightMatch(text: string, query: string): ReactNode {
    if (!query) return text;
    const lower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    const parts: ReactNode[] = [];
    let lastIdx = 0;
    let idx = lower.indexOf(queryLower, lastIdx);

    while (idx !== -1) {
        if (idx > lastIdx) {
            parts.push(text.slice(lastIdx, idx));
        }
        parts.push(
            <mark key={idx} className="search-highlight">
                {text.slice(idx, idx + query.length)}
            </mark>
        );
        lastIdx = idx + query.length;
        idx = lower.indexOf(queryLower, lastIdx);
    }
    if (lastIdx < text.length) {
        parts.push(text.slice(lastIdx));
    }
    return parts;
}

export default function SearchModal({
    open,
    onClose,
    currentDay,
    plannedEvents,
    extraEvents,
    onSelectDate,
}: Props) {
    const [keyword, setKeyword] = useState("");
    // デフォルトは「メモ」一覧
    const [category, setCategory] = useState<CategoryFilter>("memos");
    const [allMemos, setAllMemos] = useState<MemoData[]>([]);

    // 見ている日の0時0分0秒のタイムスタンプ
    const todayThreshold = useMemo(() => {
        const d = currentDay ? new Date(currentDay) : new Date();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }, [currentDay]);

    // モーダルが開かれた時にメモを全件ロード & 入力欄リセット
    useEffect(() => {
        if (!open) return;

        openDB("TimetableDB", 2, (db) => {
            if (!db.objectStoreNames.contains("memos")) {
                db.createObjectStore("memos", { keyPath: "date" });
            }
        })
            .then((db) => getAllData<MemoData>(db, "memos"))
            .then((data) => {
                setAllMemos(data || []);
            })
            .catch(() => {
                setAllMemos([]);
            });
    }, [open]);

    // モーダルを閉じる時に入力キーワードをリセット
    useEffect(() => {
        if (!open) {
            setKeyword("");
        }
    }, [open]);

    // 全メモのアイテム化（日付順ソート）
    const memoItems = useMemo(() => {
        const items: SearchItem[] = [];
        allMemos.forEach((m, idx) => {
            if (!m.text || !m.text.trim()) return;
            const parsedDate = parseMonthDayString(m.date, currentDay);
            items.push({
                id: `memo-${m.date}-${idx}`,
                type: "memo",
                typeLabel: "メモ",
                dateKey: m.date,
                date: parsedDate,
                title: m.text.trim().split("\n")[0] || "メモ",
                snippet: m.text,
            });
        });

        // 日付順ソート（昇順）
        items.sort((a, b) => {
            const timeA = a.date ? a.date.getTime() : 0;
            const timeB = b.date ? b.date.getTime() : 0;
            return timeA - timeB;
        });

        return items;
    }, [allMemos, currentDay]);

    // 全行事のアイテム化（日付順ソート）
    const eventItems = useMemo(() => {
        const items: SearchItem[] = [];
        const seen = new Set<string>();

        // 1. 年間計画行事
        Object.entries(plannedEvents).forEach(([dateKey, eventText]) => {
            if (!eventText || !eventText.trim()) return;
            const cleanTitle = stripHtmlTags(eventText);
            if (!cleanTitle) return;
            const parsedDate = parseMonthDayString(dateKey, currentDay);
            seen.add(`${dateKey}:${cleanTitle}`);
            items.push({
                id: `event-${dateKey}`,
                type: "event",
                typeLabel: "行事",
                dateKey,
                date: parsedDate,
                title: cleanTitle,
            });
        });

        // 2. 追加行事
        extraEvents?.forEach((extra, idx) => {
            if (!extra.contents || !extra.contents.trim()) return;
            const cleanTitle = stripHtmlTags(extra.contents);
            if (!cleanTitle) return;
            const key = `${extra.dates}:${cleanTitle}`;
            if (seen.has(key)) return;
            seen.add(key);
            const parsedDate = parseMonthDayString(extra.dates, currentDay);
            items.push({
                id: `extra-event-${extra.dates}-${idx}`,
                type: "event",
                typeLabel: "行事",
                dateKey: extra.dates,
                date: parsedDate,
                title: cleanTitle,
            });
        });

        // 日付順ソート（昇順）
        items.sort((a, b) => {
            const timeA = a.date ? a.date.getTime() : 0;
            const timeB = b.date ? b.date.getTime() : 0;
            return timeA - timeB;
        });

        return items;
    }, [plannedEvents, extraEvents, currentDay]);

    // 表示するアイテム（一覧時は当日以降のみ、キーワード入力時は全件対象に検索）
    const displayItems = useMemo(() => {
        const baseItems = category === "memos" ? memoItems : eventItems;
        const query = keyword.trim().toLowerCase();

        if (!query) {
            // 一覧表示：見ている日の当日から始め、過去のものは表示しない
            return baseItems.filter((item) => {
                if (!item.date) return false;
                return item.date.getTime() >= todayThreshold;
            });
        }

        // キーワード検索：過去のものも含めてすべてから検索
        return baseItems.filter((item) => {
            const matchTitle = item.title.toLowerCase().includes(query);
            const matchDate = item.dateKey.toLowerCase().includes(query);
            const matchSnippet = item.snippet?.toLowerCase().includes(query) ?? false;
            return matchTitle || matchDate || matchSnippet;
        });
    }, [category, memoItems, eventItems, keyword, todayThreshold]);

    // タブに表示する件数（一覧時は当日以降の件数、検索時はヒット件数）
    const query = keyword.trim().toLowerCase();
    const memoTabCount = useMemo(() => {
        if (!query) {
            return memoItems.filter((i) => i.date && i.date.getTime() >= todayThreshold).length;
        }
        return memoItems.filter(
            (i) =>
                i.title.toLowerCase().includes(query) ||
                i.dateKey.toLowerCase().includes(query) ||
                (i.snippet?.toLowerCase().includes(query) ?? false)
        ).length;
    }, [query, memoItems, todayThreshold]);

    const eventTabCount = useMemo(() => {
        if (!query) {
            return eventItems.filter((i) => i.date && i.date.getTime() >= todayThreshold).length;
        }
        return eventItems.filter(
            (i) =>
                i.title.toLowerCase().includes(query) ||
                i.dateKey.toLowerCase().includes(query)
        ).length;
    }, [query, eventItems, todayThreshold]);

    const handleSelect = (item: SearchItem) => {
        if (item.date) {
            onSelectDate(item.date);
        }
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title="検索" blocking={false}>
            <div className="search-modal">
                {/* 検索入力欄 */}
                <div className="search-input-box">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={
                            category === "memos"
                                ? "メモを検索（過去分も含む）…"
                                : "行事を検索（過去分も含む）…"
                        }
                        autoFocus
                    />
                    {keyword && (
                        <button
                            type="button"
                            className="search-clear-button"
                            onClick={() => setKeyword("")}
                            title="クリア"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* カテゴリ切り替えタブ（メモ、行事のみ） */}
                <div className="search-category-tabs">
                    <button
                        type="button"
                        className={`search-tab ${category === "memos" ? "active" : ""}`}
                        onClick={() => setCategory("memos")}
                    >
                        メモ
                        <span className="search-tab-count">
                            {memoTabCount}
                        </span>
                    </button>
                    <button
                        type="button"
                        className={`search-tab ${category === "events" ? "active" : ""}`}
                        onClick={() => setCategory("events")}
                    >
                        行事
                        <span className="search-tab-count">
                            {eventTabCount}
                        </span>
                    </button>
                </div>

                {/* 結果/一覧表示エリア */}
                <div className="search-results-wrapper">
                    {displayItems.length === 0 ? (
                        <div className="search-message-empty">
                            {query ? (
                                <div>
                                    「{keyword}」に一致する{category === "memos" ? "メモ" : "行事"}は見つかりませんでした。
                                </div>
                            ) : category === "memos" ? (
                                <div>
                                    今日以降のメモはありません。
                                    {memoItems.length > 0 && (
                                        <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                                            （キーワードを入力すると過去のメモも検索できます）
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    今日以降の行事はありません。
                                    {eventItems.length > 0 && (
                                        <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                                            （キーワードを入力すると過去の行事も検索できます）
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        displayItems.map((item) => (
                            <div
                                key={item.id}
                                className="search-result-card"
                                onClick={() => handleSelect(item)}
                            >
                                <div className="search-card-header">
                                    <span className={`search-badge badge-${item.type}`}>
                                        {item.typeLabel}
                                    </span>
                                    <span className="search-date-label">
                                        {highlightMatch(item.dateKey, keyword.trim())}
                                    </span>
                                </div>
                                <div className="search-card-main">
                                    <strong>
                                        {highlightMatch(item.title, keyword.trim())}
                                    </strong>
                                </div>
                                {item.snippet && item.type === "memo" && (
                                    <div className="search-memo-snippet">
                                        {highlightMatch(item.snippet, keyword.trim())}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="search-modal-footer">
                    <button type="button" onClick={onClose}>
                        閉じる
                    </button>
                </div>
            </div>
        </Modal>
    );
}
