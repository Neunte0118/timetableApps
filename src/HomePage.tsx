import { useEffect, useMemo, useState } from "react";

import Toolbar from "./components/Toolbar";
import Timetable from "./components/Timetable";
import EventMemoBox from "./components/EventMemoBox";
import Navbar from "./components/Navbar";
import AndroidNoticeBanner from "./components/AndroidNoticeBanner";

import { useModalQueue } from "./hooks/useModalQueue";

import TermModal from "./components/Modal/TermModal";
import ClassSetupModal from "./components/Modal/ClassSetupModal";
import SubjectsSetupModal from "./components/Modal/SubjectsSetupModal";
import UpdateInfoModal from "./components/Modal/UpdateInfoModal";
import SearchModal from "./components/Modal/SearchModal";
import SettingModal from "./components/Modal/SettingModal";
import HtmlDocumentModal from "./components/Modal/HtmlDocumentModal";
import AndroidAppModal from "./components/Modal/AndroidAppModal";

import helpHtml from "./content/help.html?raw";
import sourceHtml from "./content/source.html?raw";

import { getStorage, setStorage } from "./utils/storage";
import { addDays, diffInDays, formatMonthDayJa, startOfDay } from "./utils/date";

import { useDatePatternMap } from "./hooks/useDatePatternMap";
import { useClassPatternData } from "./hooks/useClassPatternData";
import { useEventsData } from "./hooks/useEventsData";
import { useHolidaysData } from "./hooks/useHolidaysData";
import { useStaticData } from "./hooks/useStaticData";
import { useSubjectsData } from "./hooks/useSubjectsData";
import { useResolvedTimetables } from "./hooks/useResolvedTimetables";
import { useCachedCSV } from "./hooks/useCachedCSV";

import type {
    NestedRecord,
    TimetableOverrideRow,
    CourseOverrideRow,
    ExtraEventRow,
    ExamTimetableRow,
    UpdateInfoRow,
    tableModeType,
} from "./types/type";
import {
    UPDATE_INFO_URL,
    OVERRIDES_URL,
    COURSE_OVERRIDES_URL,
    EXTRA_EVENT_URL,
    EXAM_TIMETABLE_URL,
    EXAM_SUBJECT_MAPPING_URL,
} from "./config/url";

function parseExamMappingRows(rows: NestedRecord[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    for (const row of rows) {
        const source = typeof row.source === "string" ? row.source.trim() : "";
        const target = typeof row.target === "string" ? row.target.trim() : "";
        if (source && target) {
            mapping[source] = target;
        }
    }
    return mapping;
}

function parseExamRows(rows: NestedRecord[]): ExamTimetableRow[] {
    return rows.map((row) => ({
        dates: typeof row.dates === "string" ? row.dates.trim() : "",
        periods: typeof row.periods === "string" ? row.periods.trim() : "",
        subjects: typeof row.subjects === "string" ? row.subjects.trim() : "",
        start_time: typeof row.start_time === "string" ? row.start_time.trim() : "",
        end_time: typeof row.end_time === "string" ? row.end_time.trim() : "",
        classroom: typeof row.classroom === "string" ? row.classroom.trim() : "-",
    }));
}

function parseUpdateInfoRows(rows: NestedRecord[]): UpdateInfoRow[] {
    return rows.map((row) => ({
        versions: typeof row.versions === "string" ? row.versions : "",
        dates: typeof row.dates === "string" ? row.dates : "",
        contents: typeof row.contents === "string" ? row.contents : "",
    }));
}

function parseOverrideRows(rows: NestedRecord[]): TimetableOverrideRow[] {
    return rows.map((row) => ({
        dates: typeof row.dates === "string" ? row.dates : "",
        classes: typeof row.classes === "string" ? row.classes : "",
        periods: typeof row.periods === "string" ? row.periods : "",
        subjects: typeof row.subjects === "string" ? row.subjects : "",
    }));
}

function parseCourseOverrideRows(rows: NestedRecord[]): CourseOverrideRow[] {
    return rows.map((row) => ({
        dates: typeof row.dates === "string" ? row.dates.trim() : "",
        periods: typeof row.periods === "string" ? row.periods.trim() : "",
        previous_course: typeof row.previous_course === "string" ? row.previous_course.trim() : "",
        new_course: typeof row.new_course === "string" ? row.new_course.trim() : "",
    }));
}

function parseExtraEventRows(rows: NestedRecord[]): ExtraEventRow[] {
    return rows.map((row) => ({
        dates: typeof row.dates === "string" ? row.dates : "",
        contents: typeof row.contents === "string" ? row.contents : "",
        light_color: typeof row.light_color === "string" ? row.light_color : undefined,
        dark_color: typeof row.dark_color === "string" ? row.dark_color : undefined,
    }));
}

type Props = {
    theme: "light" | "dark";
    toggleTheme: () => void;
    isTermAccepted: boolean;
    setIsTermAccepted: (v: boolean) => void;
    classNumber: number | null;
    setClassNumber: (v: number | null) => void;
    subjectChoices: Record<string, string> | null;
    setSubjectChoices: (v: Record<string, string>) => void;
};

export default function HomePage({
    theme,
    toggleTheme,
    isTermAccepted,
    setIsTermAccepted,
    classNumber,
    setClassNumber,
    subjectChoices,
    setSubjectChoices,
}: Props) {
    const [highlightPeriod, setHighlightPeriod] = useState<{ dateKey: string; period: number } | null>(null);
    const [expansionClassMap, setExpansionClassMap] = useState<string[]>([]);

    const { setQueue, current, setCurrent } = useModalQueue();

    const { teacherMap } = useStaticData();

    const UpdateData = useCachedCSV<UpdateInfoRow[]>({
        cacheKey: "updateData",
        url: UPDATE_INFO_URL,
        parse: parseUpdateInfoRows,
        fallback: () => [],
        errorLabel: "更新履歴の読み込みに失敗しました",
    });

    const overrides = useCachedCSV<TimetableOverrideRow[]>({
        cacheKey: "overrides",
        url: OVERRIDES_URL,
        parse: parseOverrideRows,
        fallback: () => [],
        errorLabel: "時間割変更（override）の読み込みに失敗しました",
    }) ?? [];

    const courseOverrides = useCachedCSV<CourseOverrideRow[]>({
        cacheKey: "courseOverrides",
        url: COURSE_OVERRIDES_URL,
        parse: parseCourseOverrideRows,
        fallback: () => [],
        errorLabel: "講座変更の読み込みに失敗しました",
    }) ?? [];

    const extraEvents = useCachedCSV<ExtraEventRow[]>({
        cacheKey: "extraEvents",
        url: EXTRA_EVENT_URL,
        parse: parseExtraEventRows,
        fallback: () => [],
        errorLabel: "追加行事の読み込みに失敗しました",
    }) ?? [];

    const exams = useCachedCSV<ExamTimetableRow[]>({
        cacheKey: "examTimetable",
        url: EXAM_TIMETABLE_URL,
        parse: parseExamRows,
        fallback: () => [],
        errorLabel: "考査時間割の読み込みに失敗しました",
    }) ?? [];

    const examMapping = useCachedCSV<Record<string, string>>({
        cacheKey: "examSubjectMapping",
        url: EXAM_SUBJECT_MAPPING_URL,
        parse: parseExamMappingRows,
        fallback: () => ({}),
        errorLabel: "考査科目対応表の読み込みに失敗しました",
    }) ?? {};

    const [baseDay, setBaseDay] = useState<Date>(() => startOfDay(new Date()));
    const [selectedOffset, setSelectedOffset] = useState<number>(0);

    const day = useMemo(() => addDays(baseDay, selectedOffset), [baseDay, selectedOffset]);
    const datePatternMap = useDatePatternMap();
    const classPatternData = useClassPatternData();
    const resolvedTimetables = useResolvedTimetables(classPatternData, datePatternMap);
    const { expansionMap, subjectsRoomsMap } = useSubjectsData();
    const events = useEventsData();
    const holidays = useHolidaysData();

    const [tableMode, setTableMode] = useState<tableModeType>("subjects");

    const toggleTableMode = () => {
        setTableMode((prev) => (prev === "subjects" ? "rooms" : "subjects"));
    };

    const [viewport, setViewport] = useState(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
    }));

    const daysPerRow = useMemo(() => {
        const w = viewport.width;
        if (w < 700) return 4;
        if (w < 900) return 6;
        if (w < 1300) return 8;
        if (w < 1500) return 12;
        return 16;
    }, [viewport.width]);

    const isSplit = useMemo(() => viewport.height >= 740, [viewport.height]);

    useEffect(() => {
        const onResize = () => {
            setViewport({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // 更新履歴の初回チェック：最新バージョンが前回既読と異なればモーダルをキューに積む
    const [updateChecked, setUpdateChecked] = useState(false);

    useEffect(() => {
        if (updateChecked) return;
        if (!UpdateData?.length) return;

        const latestVersion = UpdateData[0].versions;
        const lastSeen = getStorage<string>("lastSeenVersion");

        if (latestVersion && latestVersion !== lastSeen) {
            setQueue((q) => (q.includes("updateInfo") ? q : [...q, "updateInfo"]));
        }

        setUpdateChecked(true);
    }, [UpdateData, updateChecked, setQueue]);

    useEffect(() => {
        document.body.classList.toggle("use-split", isSplit);
    }, [isSplit]);

    useEffect(() => {
        const maxIndex = isSplit ? 4 + daysPerRow - 1 : daysPerRow - 1;
        setSelectedOffset((prev) => Math.max(0, Math.min(prev, maxIndex)));
    }, [isSplit, daysPerRow]);

    useEffect(() => {
        setStorage("isTermAccepted", isTermAccepted);
    }, [isTermAccepted]);

    useEffect(() => {
        setStorage("subjectChoices", subjectChoices);
    }, [subjectChoices]);

    useEffect(() => {
        setStorage("classNumber", classNumber);
    }, [classNumber]);

    // クラスの時間割から実際に登場する選択科目コード一覧を算出する。
    // classData が未ロードでも classNumber は変わりうるため、
    // 「対象データがまだ無い」場合は空配列で確定させ、
    // SubjectsSetupModal 側の「読み込み中」表示と矛盾しないようにする。
    useEffect(() => {
        if (!classNumber) {
            setExpansionClassMap([]);
            return;
        }

        const classData = resolvedTimetables?.[classNumber];

        const allSubjects = classData
            ? [
                  ...new Set(
                      Object.values(classData)
                          .flat()
                          .filter((v): v is string => typeof v === "string" && v !== "")
                  ),
              ].sort()
            : [];

        setExpansionClassMap((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(allSubjects)) {
                return prev;
            }
            return allSubjects;
        });
    }, [resolvedTimetables, classNumber]);

    useEffect(() => {
        if (!classNumber) return;

        const classData = classPatternData?.[classNumber];
        if (!classData) return;

        const subjects = getStorage<Record<string, string>>("subjectChoices") ?? {};

        if (Object.keys(subjects).length === 0) {
            setQueue((q) => (q.includes("subject") ? q : [...q, "subject"]));
        }
    }, [classNumber, classPatternData, setQueue]);

    // 初回マウント時：利用規約同意・クラス・選択科目をローカルストレージから復元
    useEffect(() => {
        const nextQueue: string[] = [];

        const storedClassNumber = getStorage<number>("classNumber") ?? null;
        const storedSubjectChoices = getStorage<Record<string, string>>("subjectChoices") ?? {};

        if (!isTermAccepted) nextQueue.push("term");

        setClassNumber(storedClassNumber);
        if (storedClassNumber === null) nextQueue.push("class");

        setSubjectChoices(storedSubjectChoices);
        setQueue(nextQueue);
        // 初回マウント時のみ実行する意図的な設計のため deps は空のままにする
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectSearchDate = (targetDate: Date, period?: number) => {
        const normalizedTarget = startOfDay(targetDate);
        const daysDiff = diffInDays(normalizedTarget, baseDay);
        const maxOffset = isSplit ? 4 + daysPerRow - 1 : daysPerRow - 1;

        if (daysDiff >= 0 && daysDiff <= maxOffset) {
            setSelectedOffset(daysDiff);
        } else {
            setBaseDay(normalizedTarget);
            setSelectedOffset(0);
        }

        if (period !== undefined) {
            const dateKey = formatMonthDayJa(normalizedTarget);
            setHighlightPeriod({ dateKey, period });
            window.setTimeout(() => {
                setHighlightPeriod((prev) =>
                    prev?.dateKey === dateKey && prev.period === period ? null : prev
                );
            }, 3500);
        } else {
            setHighlightPeriod(null);
        }
    };

    return (
        <>
            <h1 className="title">時間割アプリ</h1>

            <AndroidNoticeBanner onOpenAndroidApp={() => setQueue((q) => ["androidApp", ...q])} />

            <Toolbar
                tableMode={tableMode}
                toggleTableMode={toggleTableMode}
                setIsSearchOpen={() => setQueue((q) => [...q, "search"])}
            />

            <Timetable
                classNumber={classNumber}
                baseDay={baseDay}
                selectedOffset={selectedOffset}
                setSelectedOffset={setSelectedOffset}
                daysPerRow={daysPerRow}
                timetables={resolvedTimetables}
                subjectChoices={subjectChoices ?? {}}
                expansionMap={expansionMap ?? {}}
                subjectRoomsMap={subjectsRoomsMap ?? {}}
                teacherMap={teacherMap ?? {}}
                tableMode={tableMode}
                holidays={holidays ?? {}}
                overrides={overrides}
                courseOverrides={courseOverrides}
                exams={exams}
                examMapping={examMapping}
                highlightPeriod={highlightPeriod}
            />

            <EventMemoBox theme={theme} dayKey={day} plannedEvents={events ?? {}} />

            <Navbar
                day={day}
                onChangeDay={(next) => setBaseDay(addDays(startOfDay(next), -selectedOffset))}
                theme={theme}
                toggleTheme={toggleTheme}
                onOpenSettings={() => setQueue((q) => [...q, "settings"])}
            />

            <TermModal
                open={current === "term"}
                onClose={() => setCurrent(null)}
                isTermAccepted={isTermAccepted}
                setIsTermAccepted={setIsTermAccepted}
            />

            <HtmlDocumentModal
                open={current === "help"}
                onClose={() => setCurrent(null)}
                title="ヘルプ"
                html={helpHtml}
            />

            <HtmlDocumentModal
                open={current === "source"}
                onClose={() => setCurrent(null)}
                title="ソース"
                html={sourceHtml}
            />

            <ClassSetupModal
                open={current === "class"}
                onClose={() => setCurrent(null)}
                classNumber={classNumber}
                setClassNumber={setClassNumber}
            />

            <SubjectsSetupModal
                open={current === "subject"}
                onClose={() => setCurrent(null)}
                expansionMap={expansionMap ?? {}}
                expansionClassMap={expansionClassMap}
                subjectChoices={subjectChoices || {}}
                setSubjectChoices={setSubjectChoices}
            />

            <UpdateInfoModal
                open={current === "updateInfo"}
                onClose={() => {
                    const latestVersion = UpdateData?.[0]?.versions;

                    if (latestVersion) {
                        setStorage("lastSeenVersion", latestVersion);
                    }

                    setCurrent(null);
                }}
                data={UpdateData ?? undefined}
            />

            <SearchModal
                open={current === "search"}
                onClose={() => setCurrent(null)}
                currentDay={day}
                plannedEvents={events ?? {}}
                extraEvents={extraEvents}
                onSelectDate={handleSelectSearchDate}
            />

            <SettingModal
                open={current === "settings"}
                onClose={() => setCurrent(null)}
                onOpen={(modalType) => {
                    setQueue((q) => [modalType, ...q]);
                    setCurrent(null);
                }}
            />

            <AndroidAppModal
                open={current === "androidApp"}
                onClose={() => setCurrent(null)}
            />
        </>
    );
}
