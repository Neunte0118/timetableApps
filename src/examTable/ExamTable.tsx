import { useParams } from "react-router-dom";
import { loadExamTable } from "../hooks/useExamData";
import type { ExamDataType } from "../hooks/useExamData";
import { useEffect, useState } from "react";
import { logger } from "../utils/logger";

const log = logger.scope("ExamTable");

type Props = {
    theme: "light" | "dark";
    isTermAccepted: boolean;
    classNumber: number | null;
    subjectChoices: Record<string, string> | null;
};

const EXAM_DATA_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQy3XEeDOJ5hTIHZN8dhXqzpiWdsqpYWnZPhO4fGPe28VarMzeU8ikVIPFGJBn_m5REbH7eE83yM77O/pub?gid=139648733&single=true&output=csv";

// 選択科目コード（略称/連番付き）を試験科目名の正式表記に正規化するための対応表
const SUBJECT_NAME_ALIASES: Record<string, string> = {
    "古探": "古典探究",
    "古講": "古典講読",
    "現世読": "現代世界を読む",

    "英語Wt": "英語W",
    "数演L": "数学ⅡL",
    "数ⅡLa": "数学ⅡL",
    "数ⅡLb": "数学ⅡL",
    "数ⅡS": "数学ⅡS",
    "数講Sa": "数学講究S",
    "数講Sb": "数学講究S",

    "世講": "世界史講究",
    "世特": "世界史特講",
    "地理講": "地理講究",
    "地理特": "地理特講",
    "日講": "日本史講究",
    "日特": "日本史特講",
    "倫政講": "倫政講究",
    "倫政特": "倫政特講",

    "化S": "化学S",
    "物S": "物理S",
    "生S": "生物S",
    "化L": "化学L",
    "物L": "物理L",
    "生L": "生物L",
    "地L": "地学L",
};

// 丸数字（履修順を示す接尾辞）を除去する
const CIRCLED_NUMBER_SUFFIX = /[①②③④⑤⑥⑦⑧⑨⑩]+$/;

export default function ExamTable({ isTermAccepted, subjectChoices }: Props) {
    const { examTableId } = useParams<{ examTableId: string }>();
    const [examData, setExamData] = useState<ExamDataType[string]>();
    const [notFound, setNotFound] = useState(false);
    const [selectedDateSubjects, setSelectedDateSubjects] = useState<string[]>();
    const [copied, setCopied] = useState(false);

    const subjectChoicesSet = new Set(
        Object.values(subjectChoices ?? {})
            .map((v) => v.replace(CIRCLED_NUMBER_SUFFIX, ""))
            .map((v) => SUBJECT_NAME_ALIASES[v] ?? v)
    );

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const data = await loadExamTable(EXAM_DATA_URL);
                if (cancelled) return;

                const result = data[examTableId ?? ""];

                if (!result) {
                    setNotFound(true);
                    setExamData(undefined);
                    return;
                }

                setNotFound(false);
                setExamData(result);
            } catch (e) {
                log.error("試験時間割の読み込みに失敗しました", e);
                if (!cancelled) setNotFound(true);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [examTableId]);

    const datesList = Object.keys(examData?.dates ?? {}).sort();

    const subjectsByDate: Record<string, string[]> = Object.fromEntries(
        Object.entries(examData?.dates ?? {}).map(([date, items]) => {
            const list = Array.isArray(items) ? items : [];

            return [
                date,
                list
                    .map((item) => item.subjects)
                    .filter((subject) => subjectChoicesSet.has(subject)),
            ];
        })
    );

    const handleCopy = async () => {
        if (!examData) return;

        try {
            await navigator.clipboard.writeText(JSON.stringify(examData));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            log.error("クリップボードへのコピーに失敗しました", e);
        }
    };

    const viewSubjects = (date: string) => {
        setSelectedDateSubjects(subjectsByDate[date]);
    };

    if (!isTermAccepted) return null;

    if (notFound) {
        return <div className="exam-not-found">試験時間割が見つかりませんでした。</div>;
    }

    return (
        <div>
            <div className="info">
                <div className="examName" style={{ textAlign: "center", fontSize: "1.45rem" }}>
                    {examData?.examName}
                </div>
            </div>

            <div className="DatesButton">
                {datesList.map((date) => (
                    <button key={date} type="button" onClick={() => viewSubjects(date)}>
                        {date}
                    </button>
                ))}
            </div>

            <div className="subjectsField">
                {selectedDateSubjects?.map((subject, i) => (
                    <button key={`${subject}-${i}`} type="button" disabled>
                        {subject}
                    </button>
                ))}
            </div>

            <button type="button" onClick={handleCopy}>
                {copied ? "コピーしました" : "copy"}
            </button>
        </div>
    );
}
