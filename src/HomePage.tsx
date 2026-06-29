import { useEffect, useMemo, useState } from "react";

import Toolbar from "./components/Toolbar";
import Timetable from "./components/Timetable";
import EventMemoBox from "./components/EventMemoBox";
import Navbar from "./components/Navbar";

import { useModalQueue } from "./hooks/useModalQueue";

import TermModal from "./components/Modal/TermModal";
import ClassSetupModal from "./components/Modal/ClassSetupModal";
import SubjectSetupModal from "./components/Modal/SubjectsSetupModal";
import UpdateInfoModal from "./components/Modal/UpdateInfoModal";
import FilterModal from "./components/Modal/FilterModal";
import SettingModal from "./components/Modal/SettingModal";
import HtmlDocumentModal from "./components/Modal/HtmlDocumentModal";

import helpHtml from "./content/help.html?raw";
import sourceHtml from "./content/source.html?raw";

import { getStorage, setStorage } from "./utils/storage";
import { addDays, formatMonthDayJa, formatMonthDaySlash, startOfDay } from "./utils/date";

import { useTimetables } from "./hooks/useTimetable";
import { useStaticData } from "./hooks/useStaticData";

import { fetchCSV } from "./services/fetchCSV";

import { NestedRecord } from "./types/type";

type Props ={
  theme: "light" | "dark";
  toggleTheme: () => void;
  isTermAccepted: boolean;
  setIsTermAccepted: (v: boolean) => void;
  classNumber: number | null;
  setClassNumber: (v: number | null) => void
  subjectChoices: Record<string, string> | null;
  setSubjectChoices: (v:Record<string, string>) => void;
}

export default function HomePage({
  theme, toggleTheme,
  isTermAccepted, setIsTermAccepted,
  classNumber, setClassNumber,
  subjectChoices, setSubjectChoices
}: Props) {
    const VERSION = "3.0.0";
    
    
    const [filterSubject, setFilterSubject] = useState<string>();
    const [expansionClassMap, setExpansionClassMap] = useState<string[]>([]);

    const { setQueue, current, setCurrent } = useModalQueue();

    const {
        events,
        holidays,
        expansionMap,
        subjectsRoomsMap,
        teacherMap,
    } = useStaticData();

    const [UpdateData, setUpdateData] = useState<NestedRecord[]>();

    const [baseDay, setBaseDay] = useState<Date>(() => startOfDay(new Date()));
    const [selectedOffset, setSelectedOffset] = useState<number>(0);

    const day = useMemo(() => addDays(baseDay, selectedOffset), [baseDay, selectedOffset]);
    const dayKey = useMemo(() => formatMonthDayJa(day), [day]);
    const dayKeySlash = useMemo(() => formatMonthDaySlash(day), [day])

    const {timetables, loadTimetable} = useTimetables();
    const [tableMode, setTableMode] = useState<"subjects" | "rooms" | "teachers">("subjects");
    
    const toggleTableMode = () => {
        setTableMode((prev) => {
            if (prev === "subjects") return "rooms";
            //if (prev === "rooms") return "teachers";
            return "subjects";
        });
    };
    
type TimetableOverrideRow = {
    dates: string;
    classes: string;
    periods: string;
    subjects: string;
};

    const [overrides, setOverrides] = useState<TimetableOverrideRow[]>([]);

    const [showUpdateList, setShowUpdateList] = useState<boolean>(false);

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

    useEffect(() => {
        const CACHE_KEY = "updateData";

        const load = async () => {
            // キャッシュを先に表示
            const cached = getStorage<NestedRecord[]>(CACHE_KEY);
            if (cached) {
                setUpdateData(cached);
            }

            try {
                const updateData = await fetchCSV(
                    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSizltFHoOWYdi97m2q_x21-XHwaeeMTzbUk0jlWCZRAD-CmsGn9uKZQMe2rHbIxP7_pEekWK84yf9/pub?gid=2144261983&single=true&output=csv"
                );

                setUpdateData(updateData);
                setStorage(CACHE_KEY, updateData);
            } catch (error) {
                console.error(error);
            }
        };

        load();
    }, []);

    const [updateChecked, setUpdateChecked] = useState(false);

    useEffect(() => {
        if (updateChecked) return;
        if (!UpdateData?.length) return;

        const latestVersion = UpdateData[0].versions;
        const lastSeen = getStorage<string>("lastSeenVersion");

        if (
            typeof latestVersion === "string" &&
            latestVersion !== lastSeen
        ) {
            setQueue(q => {
                if (q.includes("updateInfo")) return q;
                return [...q, "updateInfo"];
            });
        }

        setUpdateChecked(true);
    }, [UpdateData]);

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

    useEffect(() => {
        if (!classNumber) return;
        loadTimetable(classNumber);
    }, [classNumber, loadTimetable]);

    useEffect(() => {
        if (!classNumber) return;

        const classData = timetables?.[classNumber];
        if (!classData) return;

        const allSubjects = [
            ...new Set(
                Object.values(classData)
                    .flat()
                    .filter((v): v is string => typeof v === "string")
            )
        ].sort();

        // ここで比較して変わったときだけ更新
        setExpansionClassMap(prev => {
            if (JSON.stringify(prev) === JSON.stringify(allSubjects)) {
                return prev;
            }
            return allSubjects;
        });
    }, [timetables, classNumber]);

    useEffect(() => {
        if (!classNumber) return;

        const classData = timetables?.[classNumber];
        if (!classData) return;

        const subjects =
            getStorage<Record<string, string>>("subjectChoices") ?? {};

        if (Object.keys(subjects).length === 0) {
            setQueue((q) => {
                if (q.includes("subject")) return q;
                return [...q, "subject"];
            });
        }
    }, [classNumber, timetables]);
    
    useEffect(() => {
        const nextQueue = [];

        const storage = {
            classnum: getStorage<number>("classNumber"),
            selectedSubjects: getStorage<Record<string, string>>("subjectChoices"),
        };

        if (!isTermAccepted) nextQueue.push("term");

        // classnum は number | null
        const classnum = storage.classnum ?? null;
        setClassNumber(classnum);
        if (classnum === null) nextQueue.push("class");

        // subjects は Record<string,string> に変換
        const subjects = storage.selectedSubjects ?? {};
        setSubjectChoices(subjects);

        /*
        if (
            Object.keys(subjects).length === 0 &&
            classnum !== null
        ) {
            // timetable読み込み後に開く
            setTimeout(() => {
                setQueue((q) => [...q, "subject"]);
            }, 0);
        }
        */

        setQueue(nextQueue);
    }, []);

    const filterTargets = [
        ...new Set(
            expansionClassMap.map((e) => (
                subjectChoices?.[e] ?? e
            ))
        )
    ].sort();

    useEffect(() => {
        const CACHE_KEY = "overrides";

        const parseOverrides = (data: NestedRecord[]): TimetableOverrideRow[] =>
            data.map((row) => ({
                dates: typeof row.dates === "string" ? row.dates : "",
                classes: typeof row.classes === "string" ? row.classes : "",
                periods: typeof row.periods === "string" ? row.periods : "",
                subjects: typeof row.subjects === "string" ? row.subjects : "",
            }));

        const loadOverrides = async () => {
            // キャッシュを先に表示
            const cached = getStorage<NestedRecord[]>(CACHE_KEY);
            if (cached) {
                setOverrides(parseOverrides(cached));
            }

            try {
                const data = await fetchCSV(
                    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQiStJCsPKp1ndi958BLOajBqizE_aIcO2Z0f9hPgiyPV19rnWB3qVcrLuVEaeCeE5ddaIudtX7VkzE/pub?gid=1149682638&single=true&output=csv"
                );

                setOverrides(parseOverrides(data));
                setStorage(CACHE_KEY, data);
            } catch (e) {
                console.error("override読み込み失敗", e);

                // キャッシュも無い場合だけ空にする
                if (!getStorage<NestedRecord[]>(CACHE_KEY)) {
                    setOverrides([]);
                }
            }
        };

        loadOverrides();
    }, []);
console.log(JSON.stringify(UpdateData?.[0], null, 2));
    return (
        <>
            <h1 className="title">時間割アプリ</h1>

            <Toolbar 
                tableMode={tableMode}
                toggleTableMode={toggleTableMode}
                setIsFilterOpen={() => setQueue(q => [...q, "filter"])}
            />

            <Timetable
                classNumber={classNumber}
                baseDay={baseDay}
                selectedOffset={selectedOffset}
                setSelectedOffset={setSelectedOffset}
                daysPerRow={daysPerRow}
                isSplit={isSplit}
                timetables={timetables}
                subjectChoices={subjectChoices ?? {}}
                expansionMap={expansionMap ?? {}}
                subjectRoomsMap={subjectsRoomsMap ?? []}
                teacherMap={teacherMap ?? {}}
                tableMode={tableMode}
                filterSubject={filterSubject}
                holidays={holidays ?? {}}
                overrides={overrides}
            />

            <EventMemoBox
                theme={theme}
                dayKey={day}
                plannedEvents={events ?? {}}
            />

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

            <SubjectSetupModal
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

                    if (typeof latestVersion === "string") {
                        setStorage("lastSeenVersion", latestVersion);
                    }

                    setCurrent(null);
                }}
                isList={showUpdateList}
                data={UpdateData}
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
    )
}
