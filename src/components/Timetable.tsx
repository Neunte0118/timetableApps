import "./Timetable.css";
import type {
    tableModeType,
    TeacherMap,
    TimetableOverrideRow,
    CourseOverrideRow,
    ExamTimetableRow,
    SpecialScheduleRow,
    ClassTimetableData,
} from "../types/type";
import { addDays, formatMonthDayJa, formatMonthDaySlash, normalizeDateKey, isLaterSemester } from "../utils/date";
import { resolveExamCell } from "../utils/examUtils";
import { resolveCode } from "../hooks/useResolvedTimetables";

type Props = {
    classNumber: number | null;
    baseDay: Date;
    selectedOffset: number;
    setSelectedOffset: (v: number) => void;
    daysPerRow: number;
    timetables: Record<number, Record<string, string[]>>;
    subjectChoices: Record<string, string>;
    expansionMap: Record<string, string[]>;
    subjectRoomsMap: Record<string, string>;
    teacherMap: TeacherMap;
    tableMode: tableModeType;
    holidays: Record<string, string>;
    overrides?: TimetableOverrideRow[];
    courseOverrides?: CourseOverrideRow[];
    exams?: ExamTimetableRow[];
    examMapping?: Record<string, string>;
    highlightPeriod?: { dateKey: string; period: number } | null;
    specialSchedules?: SpecialScheduleRow[];
    earlierClassPatternData?: Record<number, ClassTimetableData> | null;
    laterClassPatternData?: Record<number, ClassTimetableData> | null;
    classPatternData?: Record<number, ClassTimetableData> | null;
};

// HR担任（クラス番号は1始まり、配列インデックスは0始まり）
const HR_TEACHERS = ["丸山", "小野", "衛藤", "東", "本城", "木山", "樋口", "村上", "濱田"];

type PEKey = "体育共修" | "体育別修";

const isPEKey = (v: string): v is PEKey => v === "体育共修" || v === "体育別修";

const PE_TEACHERS: Record<PEKey, Record<string, string | undefined>> = {
    "体育共修": {
        "ゴルフ": "市田",
        "テニス": "未定義",
        "ﾊﾞﾄﾞﾐﾝﾄﾝ": "未定義",
        "卓球": "未定義",
    },
    "体育別修": {
        "ｿﾌﾄﾎﾞｰﾙ": "未定義",
        "テニス": "塩見",
        "ﾀﾞﾌﾞﾙﾀﾞｯﾁ": "未定義",
        "バスケ": "未定義",
    },
};

export default function Timetable({
    classNumber,
    baseDay,
    selectedOffset,
    setSelectedOffset,
    daysPerRow,
    timetables,
    subjectChoices,
    expansionMap,
    subjectRoomsMap,
    teacherMap,
    tableMode,
    holidays,
    overrides,
    courseOverrides,
    exams,
    examMapping,
    highlightPeriod,
    specialSchedules,
    earlierClassPatternData,
    laterClassPatternData,
    classPatternData,
}: Props) {
    const timetableData = classNumber ? timetables?.[classNumber] : undefined;

    const getClassDataForDate = (dateKey: string): ClassTimetableData | undefined => {
        if (!classNumber) return undefined;
        const isLater = isLaterSemester(dateKey);
        const map = (isLater ? laterClassPatternData : earlierClassPatternData)
            ?? earlierClassPatternData
            ?? laterClassPatternData
            ?? classPatternData;
        return map?.[classNumber];
    };

    const findSpecialSchedule = (dateKey: string, period: number): SpecialScheduleRow | undefined => {
        if (!specialSchedules || specialSchedules.length === 0) return undefined;
        return specialSchedules.find((s) => {
            const d = normalizeDateKey(s.date);
            return (d === dateKey || s.date.trim() === dateKey) && Number(s.period) === period;
        });
    };

    const resolveTeacher = (subjectName: string, originalCode: string): string | undefined => {
        if (subjectName === "HR") {
            return HR_TEACHERS[(classNumber ?? 0) - 1];
        }

        if (isPEKey(originalCode)) {
            return PE_TEACHERS[originalCode]?.[subjectName];
        }

        const teacherName = teacherMap[subjectName];

        if (typeof teacherName === "string") {
            return teacherName;
        }

        if (Array.isArray(teacherName)) {
            return teacherName[(classNumber ?? 0) - 1];
        }

        return undefined;
    };

    const buildOffsets = (start: number, length: number) =>
        [...Array(length)].map((_, i) => start + i);

    const table1Offsets = buildOffsets(0, daysPerRow);
    const table2Offsets = buildOffsets(daysPerRow, daysPerRow);

    const today = new Date();
    const isToday = (date: Date) =>
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

    const findOverride = (dateKey: string, period: number): TimetableOverrideRow | undefined => {
        if (!overrides) return undefined;
        return overrides.find(
            (o) =>
                o.dates === dateKey &&
                (o.classes === "0" || Number(o.classes) === classNumber) &&
                Number(o.periods) === period
        );
    };

    const findCourseOverride = (
        dateKey: string,
        period: number,
        currentCourse: string,
        baseCode: string
    ): CourseOverrideRow | undefined => {
        if (!courseOverrides) return undefined;
        return courseOverrides.find(
            (c) =>
                c.dates === dateKey &&
                Number(c.periods) === period &&
                ((currentCourse && c.previous_course === currentCourse) ||
                 (baseCode && c.previous_course === baseCode))
        );
    };

    const renderTable = (tableClassName: string, offsets: number[]) => {
        // 5限以上（6限、7限...）が追加されても動的に反映
        let maxPeriod = 5;

        offsets.forEach((offset) => {
            const dateKey = formatMonthDayJa(addDays(baseDay, offset));
            const ttLength = timetableData?.[dateKey]?.length ?? 0;
            if (ttLength > maxPeriod) maxPeriod = ttLength;

            overrides?.forEach((o) => {
                if (
                    o.dates === dateKey &&
                    (o.classes === "0" || Number(o.classes) === classNumber)
                ) {
                    const p = Number(o.periods);
                    if (Number.isFinite(p) && p > maxPeriod) maxPeriod = p;
                }
            });

            courseOverrides?.forEach((c) => {
                if (c.dates === dateKey) {
                    const p = Number(c.periods);
                    if (Number.isFinite(p) && p > maxPeriod) maxPeriod = p;
                }
            });

            exams?.forEach((e) => {
                if (e.dates === dateKey) {
                    const p = Number(e.periods);
                    if (Number.isFinite(p) && p > maxPeriod) maxPeriod = p;
                }
            });

            specialSchedules?.forEach((s) => {
                const d = normalizeDateKey(s.date);
                if (d === dateKey || s.date.trim() === dateKey) {
                    const p = Number(s.period);
                    if (Number.isFinite(p) && p > maxPeriod) maxPeriod = p;
                }
            });
        });

        const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

        const hasSpecialSchedule = offsets.some((offset) => {
            const dateKey = formatMonthDayJa(addDays(baseDay, offset));
            return specialSchedules?.some((s) => {
                const d = normalizeDateKey(s.date);
                return d === dateKey || s.date.trim() === dateKey;
            });
        });

        const isCompact = maxPeriod >= 6 || hasSpecialSchedule;
        const tableClasses = [
            tableClassName,
            isCompact ? "timetable-compact" : "",
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <table className={tableClasses}>
                <thead>
                    <tr>
                        <th className="toggle-header">{classNumber}組</th>
                        {offsets.map((offset) => {
                            const date = addDays(baseDay, offset);
                            const dateKey = formatMonthDayJa(date);
                            const isSelected = offset === selectedOffset;
                            const isSaturday = date.getDay() === 6;
                            const isHoliday = date.getDay() === 0 || (!isSaturday && Boolean(holidays?.[dateKey]));
                            const isTodayCell = isToday(date);

                            const headerClassName = [
                                "date-cell",
                                isSelected ? "date-selected" : "",
                                isTodayCell ? "today" : "",
                                isSaturday ? "saturday" : "",
                                isHoliday ? "holiday" : "",
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <th
                                    key={offset}
                                    className={headerClassName}
                                    onClick={() => setSelectedOffset(offset)}
                                >
                                    {formatMonthDaySlash(date)}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {periods.map((period) => (
                        <tr key={period}>
                            <th>{period}限</th>
                            {offsets.map((offset) => {
                                const date = addDays(baseDay, offset);
                                const dateKey = formatMonthDayJa(date);

                                const isSelected = offset === selectedOffset;
                                const isHighlighted = Boolean(
                                    highlightPeriod &&
                                    highlightPeriod.dateKey === dateKey &&
                                    highlightPeriod.period === period
                                );

                                // 考査セルの判定
                                const examCell = resolveExamCell(
                                    dateKey,
                                    period,
                                    exams,
                                    subjectChoices,
                                    examMapping
                                );

                                if (examCell) {
                                    let display = examCell.displaySubject;
                                    if (tableMode === "rooms") {
                                        const formatSingleRoom = (roomStr: string) => {
                                            const r = roomStr.trim();
                                            if (!r || r === "-" || r === "$hr" || r === "__hr__") {
                                                return `${classNumber}組`;
                                            }
                                            return r.replace(/([0-9０-９]+組)教室$/, "$1");
                                        };

                                        const rawRoom = examCell.classroom?.trim();
                                        if (rawRoom && rawRoom.includes("/")) {
                                            const rooms = rawRoom.split("/").map(formatSingleRoom);
                                            display = Array.from(new Set(rooms)).join("/");
                                        } else {
                                            display = formatSingleRoom(rawRoom || "");
                                        }
                                    } else if (tableMode === "teachers") {
                                        if (examCell.allExams && examCell.allExams.length > 1) {
                                            const teachers = examCell.allExams
                                                .map((e) => resolveTeacher(e.subjects, e.subjects))
                                                .filter(Boolean);
                                            const uniqueTeachers = Array.from(new Set(teachers));
                                            display = uniqueTeachers.length > 0 ? uniqueTeachers.join("/") : "-";
                                        } else {
                                            display = resolveTeacher(examCell.exam.subjects, examCell.exam.subjects) ?? "-";
                                        }
                                    }

                                    const cellClassName = [
                                        "subject",
                                        "exam-cell",
                                        examCell.isSelected ? "exam-purple" : "exam-unselected",
                                        isSelected ? "subject-selected" : "",
                                        isHighlighted ? "highlight-cell" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    return (
                                        <td
                                            key={`${offset}-${period}`}
                                            className={cellClassName}
                                            onClick={() => setSelectedOffset(offset)}
                                        >
                                            {examCell.startTime && (
                                                <span className="exam-time exam-time-start">
                                                    {examCell.startTime}
                                                </span>
                                            )}
                                            <span className="exam-subject-title">{display || "\u00A0"}</span>
                                            {examCell.endTime && (
                                                <span className="exam-time exam-time-end">
                                                    {examCell.endTime}
                                                </span>
                                            )}
                                        </td>
                                    );
                                }

                                const specialSchedule = findSpecialSchedule(dateKey, period);
                                const cellClassData = getClassDataForDate(dateKey);
                                const rawSpecial = specialSchedule
                                    ? (cellClassData
                                          ? resolveCode(specialSchedule.subject.trim(), cellClassData) || specialSchedule.subject.trim()
                                          : specialSchedule.subject.trim())
                                    : "";
                                const raw = rawSpecial || (timetableData?.[dateKey]?.[period - 1] ?? "");
                                const override = findOverride(dateKey, period);

                                const code = override?.subjects ?? raw;
                                const isExpandable = Boolean(expansionMap?.[code]);
                                const currentCourse = isExpandable ? (subjectChoices?.[code] ?? code) : code;

                                const courseOverride = (currentCourse || code)
                                    ? findCourseOverride(dateKey, period, currentCourse, code)
                                    : undefined;

                                const effectiveSubject = courseOverride?.new_course ?? currentCourse;
                                const isChanged = Boolean(override) || Boolean(courseOverride);

                                let display = "";
                                if (effectiveSubject) {
                                    if (tableMode === "subjects") {
                                        display = effectiveSubject;
                                    } else if (tableMode === "rooms") {
                                        if (courseOverride) {
                                            display = subjectRoomsMap?.[effectiveSubject] ?? (isExpandable ? "?" : `${classNumber}組`);
                                        } else if (!isExpandable) {
                                            display = `${classNumber}組`;
                                        } else {
                                            display = subjectRoomsMap?.[effectiveSubject] ?? "?";
                                        }
                                        display = display.replace(/([0-9０-９]+組)教室$/, "$1");
                                    } else {
                                        // teachers
                                        display = resolveTeacher(effectiveSubject, code) ?? "";
                                    }
                                }

                                const startTime = specialSchedule?.start_time?.trim() && specialSchedule.start_time.trim() !== "-"
                                    ? specialSchedule.start_time.trim()
                                    : "";
                                const endTime = specialSchedule?.end_time?.trim() && specialSchedule.end_time.trim() !== "-"
                                    ? specialSchedule.end_time.trim()
                                    : "";
                                const hasSpecialTime = Boolean(startTime || endTime);

                                const cellClassName = [
                                    "subject",
                                    hasSpecialTime ? "has-special-time exam-cell" : "",
                                    isSelected ? "subject-selected" : "",
                                    isHighlighted ? "highlight-cell" : "",
                                    isChanged ? "timetable-changed" : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ");

                                return (
                                    <td
                                        key={`${offset}-${period}`}
                                        className={cellClassName}
                                        onClick={() => setSelectedOffset(offset)}
                                    >
                                        {startTime && (
                                            <span className="exam-time exam-time-start">
                                                {startTime}
                                            </span>
                                        )}
                                        <span className="exam-subject-title">{display || "\u00A0"}</span>
                                        {endTime && (
                                            <span className="exam-time exam-time-end">
                                                {endTime}
                                            </span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="timetable">
            {renderTable("timetable-1", table1Offsets)}
            {renderTable("timetable-2", table2Offsets)}
        </div>
    );
}
