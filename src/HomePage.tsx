import { useEffect, useMemo, useState } from "react";

import Toolbar from "./components/Toolbar";
import Timetable from "./components/Timetable";
import EventMemoBox from "./components/EventMemoBox";
import Navbar from "./components/Navbar";

import { useModalQueue } from "./hooks/useModalQueue";

import TermModal from "./components/Modal/TermModal";
import ClassSetupModal from "./components/Modal/ClassSetupModal";
import SubjectsSetupModal from "./components/Modal/SubjectsSetupModal";
import UpdateInfoModal from "./components/Modal/UpdateInfoModal";
import FilterModal from "./components/Modal/FilterModal";
import SettingModal from "./components/Modal/SettingModal";
import HtmlDocumentModal from "./components/Modal/HtmlDocumentModal";

import helpHtml from "./content/help.html?raw";
import sourceHtml from "./content/source.html?raw";

import { getStorage, setStorage } from "./utils/storage";
import { addDays, startOfDay } from "./utils/date";

import { useDatePatternMap } from "./hooks/useDatePatternMap";
import { useClassPatternData } from "./hooks/useClassPatternData";
import { useEventsData } from "./hooks/useEventsData";
import { useHolidaysData } from "./hooks/useHolidaysData";
import { useStaticData } from "./hooks/useStaticData";
import { useSubjectsData } from "./hooks/useSubjectsData";
import { useResolvedTimetables } from "./hooks/useResolvedTimetables";
import { useCachedCSV } from "./hooks/useCachedCSV";

import type { NestedRecord, TimetableOverrideRow, UpdateInfoRow, tableModeType } from "./types/type";

const UPDATE_INFO_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSizltFHoOWYdi97m2q_x21-XHwaeeMTzbUk0jlWCZRAD-CmsGn9uKZQMe2rHbIxP7_pEekWK84yf9/pub?gid=2144261983&single=true&output=csv";

const OVERRIDES_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQiStJCsPKp1ndi958BLOajBqizE_aIcO2Z0f9hPgiyPV19rnWB3qVcrLuVEaeCeE5ddaIudtX7VkzE/pub?gid=1149682638&single=true&output=csv";

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
    const [filterSubject, setFilterSubject] = useState<string>();
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

    const filterTargets = useMemo(
        () =>
            [...new Set(expansionClassMap.map((e) => subjectChoices?.[e] ?? e))].sort(),
        [expansionClassMap, subjectChoices]
    );

    return (
        <>
            <h1 className="title">時間割アプリ</h1>

            <Toolbar
                tableMode={tableMode}
                toggleTableMode={toggleTableMode}
                setIsFilterOpen={() => setQueue((q) => [...q, "filter"])}
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
                filterSubject={filterSubject}
                holidays={holidays ?? {}}
                overrides={overrides}
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

            <FilterModal
                open={current === "filter"}
                onClose={() => setCurrent(null)}
                filterSubject={filterSubject}
                setFilterSubject={setFilterSubject}
                options={filterTargets}
            />

            <SettingModal
                open={current === "settings"}
                onClose={() => setCurrent(null)}
                onOpen={(modalType) => {
                    setQueue((q) => [modalType, ...q]);
                    setCurrent(null);
                }}
            />
        </>
    );
}
