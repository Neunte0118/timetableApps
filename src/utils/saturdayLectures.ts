import type { SpecialScheduleRow, TimetableOverrideRow } from "../types/type";

export type SaturdayLectureDef = {
    key: string;
    aliases: string[];
    period: number;
    options: string[];
};

export const SATURDAY_LECTURES: SaturdayLectureDef[] = [
    {
        key: "土曜講習①",
        aliases: ["土曜講習①", "土曜講習1", "土曜講習１", "講習①", "講習1", "講習１"],
        period: 1,
        options: ["数学D", "数学F", "なし"],
    },
    {
        key: "土曜講習②",
        aliases: ["土曜講習②", "土曜講習2", "土曜講習２", "講習②", "講習2", "講習２"],
        period: 2,
        options: ["倫理", "数学E", "なし"],
    },
    {
        key: "土曜講習③",
        aliases: ["土曜講習③", "土曜講習3", "土曜講習３", "講習③", "講習3", "講習３"],
        period: 3,
        options: ["国語A", "なし"],
    },
    {
        key: "土曜講習④",
        aliases: ["土曜講習④", "土曜講習4", "土曜講習４", "講習④", "講習4", "講習４"],
        period: 4,
        options: ["国語B", "なし"],
    },
];

export const SATURDAY_LECTURES_MAP: Record<string, string[]> = {
    "土曜講習①": ["数学D", "数学F", "なし"],
    "土曜講習②": ["倫理", "数学E", "なし"],
    "土曜講習③": ["国語A", "なし"],
    "土曜講習④": ["国語B", "なし"],
};

export const SATURDAY_LECTURE_KEYS = new Set(SATURDAY_LECTURES.map((l) => l.key));

/**
 * 与えられたキーが土曜講習に関連するものか判定
 */
export function isSaturdayLectureKey(key: string): boolean {
    if (!key) return false;
    const trimmed = key.trim();
    return SATURDAY_LECTURES.some(
        (l) => l.key === trimmed || l.aliases.includes(trimmed)
    );
}

/**
 * 特別時程などの科目文字列が、土曜講習の選択肢（例: "倫理" に対して "倫理C"）に一致するか判定する
 */
export function doesSubjectMatchOption(subjectText: string, option: string): boolean {
    if (!subjectText || !option || option === "なし") return false;
    return subjectText.includes(option);
}

/**
 * 土曜日の時程変更（特別時程や時間割変更）における表示科目を、ユーザーの選択科目を反映して解決する
 */
export function resolveSaturdaySubject({
    period,
    code,
    specialSchedule,
    specialSchedules,
    resolvedSpecialSubjects,
    override,
    subjectChoices,
}: {
    period: number;
    code: string;
    specialSchedule?: SpecialScheduleRow;
    specialSchedules?: SpecialScheduleRow[];
    resolvedSpecialSubjects?: string[];
    override?: TimetableOverrideRow;
    subjectChoices?: Record<string, string>;
}): string | null {
    const lectureDef = SATURDAY_LECTURES.find((l) => l.period === period);
    if (!lectureDef) return null;

    // ユーザーが選択した科目（"数学D", "数学F", "なし" など）
    const chosenSubject = (
        subjectChoices?.[lectureDef.key] ||
        lectureDef.aliases.map((a) => subjectChoices?.[a]).find(Boolean) ||
        ""
    ).trim();

    const overrideSubject = override?.subjects?.trim() ?? "";
    if (override && !overrideSubject) {
        return null;
    }

    const specialList = specialSchedules ?? (specialSchedule ? [specialSchedule] : []);
    const specialCandidates = (
        resolvedSpecialSubjects && resolvedSpecialSubjects.length > 0
            ? resolvedSpecialSubjects
            : specialList.map((s) => s.subject ?? "")
    )
        .map((s) => s.trim())
        .filter(Boolean);

    const rawCode = code?.trim() ?? "";

    // 候補となる元の文字列一覧（時間割変更 > 特別時程の全該当行 > code）
    const candidates = override
        ? [overrideSubject]
        : specialCandidates.length > 0
          ? specialCandidates
          : rawCode
            ? [rawCode]
            : [];

    const hasSpecialSchedule = specialList.length > 0;
    const hasScheduleChange = Boolean(override || hasSpecialSchedule);

    // 1. 直近のエイリアス一致 ("土曜講習①", "土曜講習1" 等)
    const aliasMatch = candidates.find((c) => lectureDef.aliases.some((alias) => c === alias));
    if (aliasMatch) {
        return chosenSubject || "なし";
    }

    // 2. 時限番号なしの "土曜講習" または "講習"
    const genericMatch = candidates.find((c) => /^(土曜講習|講習)$/.test(c));
    if (genericMatch) {
        return chosenSubject || "なし";
    }

    // 3. 具体的な講習科目が含まれている場合（例: "数学D", "数学F", "倫理C", "数学E", "数学D, 数学F" 等）
    const nonNoneOptions = lectureDef.options.filter((opt) => opt !== "なし");
    const hasExplicitOption = candidates.some((c) =>
        nonNoneOptions.some((opt) => doesSubjectMatchOption(c, opt))
    );
    if (hasExplicitOption) {
        if (!chosenSubject || chosenSubject === "なし") {
            return "なし";
        }
        // 選択した科目がその日に実際に開講されている場合のみ表示する
        const isChosenHeldToday = candidates.some((c) =>
            doesSubjectMatchOption(c, chosenSubject)
        );
        return isChosenHeldToday ? chosenSubject : "なし";
    }

    // 4. 土曜日に特別時程または時間割変更（時程変更）が存在し、該当の時限（1〜4限）である場合
    if (hasScheduleChange) {
        const firstCandidate = candidates[0] ?? "";
        // 特別時程で時間が設定されている場合や、講習表記がある場合
        if (
            !firstCandidate ||
            firstCandidate === "-" ||
            firstCandidate.includes("講習") ||
            firstCandidate.includes("時程")
        ) {
            return chosenSubject || "なし";
        }
    }

    return null;
}
