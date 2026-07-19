import "./Timetable.css";
import type { tableModeType, TeacherMap, TimetableOverrideRow } from "../types/type";
import { addDays, formatMonthDayJa, formatMonthDaySlash } from "../utils/date";

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
    filterSubject?: string;
    holidays: Record<string, string>;
    overrides?: TimetableOverrideRow[];
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
    filterSubject,
    holidays,
    overrides,
}: Props) {
    const timetableData = classNumber ? timetables?.[classNumber] : undefined;

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

    const resolveCell = (code: string | undefined) => {
        const original = code ?? "";
        if (!original) {
            return { display: "", subjectName: "" };
        }

        const isExpandable = Boolean(expansionMap?.[original]);
        const subjectName = isExpandable ? (subjectChoices?.[original] ?? original) : original;

        if (tableMode === "subjects") {
            return { display: subjectName, subjectName };
        }

        if (tableMode === "rooms") {
            if (!isExpandable) return { display: `${classNumber}組教室`, subjectName };
            return { display: subjectRoomsMap?.[subjectName] ?? "?", subjectName };
        }

        // teachers
        return { display: resolveTeacher(subjectName, original) ?? "", subjectName };
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

    const hasOverrideForPeriod = (dateKey: string, period: number): boolean =>
        overrides?.some(
            (o) =>
                o.dates === dateKey &&
                (o.classes === "0" || Number(o.classes) === classNumber) &&
                Number(o.periods) === period
        ) ?? false;

    const renderTable = (tableClassName: string, offsets: number[]) => {
        const hasSixthPeriod = offsets.some((offset) => {
            const dateKey = formatMonthDayJa(addDays(baseDay, offset));
            const hasTimetable6 = (timetableData?.[dateKey]?.length ?? 0) >= 6;
            return hasTimetable6 || hasOverrideForPeriod(dateKey, 6);
        });

        const periods = hasSixthPeriod ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];

        return (
            <table className={tableClassName}>
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
                                const raw = timetableData?.[dateKey]?.[period - 1] ?? "";
                                const override = findOverride(dateKey, period);

                                const code = override?.subjects ?? raw;
                                const { display, subjectName } = resolveCell(code);

                                const isChanged = Boolean(override);
                                const isSelected = offset === selectedOffset;
                                const hasFilter = Boolean(filterSubject);
                                const isHit = hasFilter && subjectName === filterSubject;
                                const isDim = hasFilter && !isHit && Boolean(subjectName);

                                const cellClassName = [
                                    "subject",
                                    isSelected ? "subject-selected" : "",
                                    isHit ? "filter-hit" : "",
                                    isDim ? "filter-dim" : "",
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
                                        {display}
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
