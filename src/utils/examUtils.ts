import type { ExamTimetableRow } from "../types/type";

export const SCIENCE_L_ORDER = ["物L", "化L", "生L", "地L"] as const;
export type ScienceLAbbr = (typeof SCIENCE_L_ORDER)[number];

/**
 * 物理L, 化学L, 生物L, 地学Lの4科目（枝番・丸数字含む）の略称（物L, 化L, 生L, 地L）を取得する
 */
export function getScienceLAbbr(subjectName: string | undefined): ScienceLAbbr | null {
    if (!subjectName) return null;
    const s = subjectName.trim();
    if (s.startsWith("物理L") || s.startsWith("物L")) return "物L";
    if (s.startsWith("化学L") || s.startsWith("化L")) return "化L";
    if (s.startsWith("生物L") || s.startsWith("生L")) return "生L";
    if (s.startsWith("地学L") || s.startsWith("地L")) return "地L";
    return null;
}

/**
 * 考査科目名とターゲット科目名（または対応表のtarget）が合致するか判定
 * （考査CSV側の「現世読」と対応CSV側の「現代世界を読む」の表記一致を含む）
 */
export function isExamTargetMatch(examSubject: string, targetSubject: string): boolean {
    if (!examSubject || !targetSubject) return false;
    const s1 = examSubject.trim();
    const s2 = targetSubject.trim();
    if (s1 === s2) return true;
    if (
        (s1 === "現世読" && s2 === "現代世界を読む") ||
        (s1 === "現代世界を読む" && s2 === "現世読")
    ) {
        return true;
    }
    // 丸数字を除去したベース名が一致する場合（例: ユーザー選択が「化学L」で考査が「化学L①」等のケース）
    const stripCircled = (str: string) => str.replace(/[①②③④⑤⑥⑦⑧⑨⑩]+$/, "");
    if (s1 === stripCircled(s2) || s2 === stripCircled(s1)) {
        return true;
    }
    return false;
}

/**
 * ユーザーの選択科目のうち、考査科目と合致するものがあるか判定する
 */
export function isUserSelectedExam(
    examSubject: string,
    userChoices: string[],
    mapping: Record<string, string>
): boolean {
    if (!examSubject || !userChoices || userChoices.length === 0) return false;

    return userChoices.some((choice) => {
        if (!choice) return false;
        const trimmedChoice = choice.trim();

        // 1. ユーザー選択科目そのものが考査科目と一致する場合
        if (isExamTargetMatch(examSubject, trimmedChoice)) return true;

        // 2. 対応CSV（source -> target）で変換したターゲットが考査科目と合致する場合
        const mappedTarget = mapping[trimmedChoice];
        if (mappedTarget && isExamTargetMatch(examSubject, mappedTarget)) {
            return true;
        }

        return false;
    });
}

/**
 * 考査科目が「選択科目」であるかを判定する
 * 対応CSVの target または source に存在する場合は選択科目、それ以外（例: 現代文、英語W、英語R等）は全員共通の必修科目
 */
export function isElectiveExamSubject(
    examSubject: string,
    mapping: Record<string, string>
): boolean {
    if (!examSubject) return false;
    const trimmed = examSubject.trim();

    // 理科演習L（物理L, 化学L, 生物L, 地学L）は選択科目
    if (getScienceLAbbr(trimmed) !== null) {
        return true;
    }

    // 対応表の target または source に存在するか
    for (const [src, tgt] of Object.entries(mapping)) {
        if (isExamTargetMatch(trimmed, tgt) || isExamTargetMatch(trimmed, src)) {
            return true;
        }
    }

    return false;
}

export type ExamCellResolution = {
    exam: ExamTimetableRow;
    allExams?: ExamTimetableRow[];
    isSelected: boolean;
    displaySubject: string;
    startTime: string;
    endTime: string;
    classroom: string;
};

/**
 * 特定の日付・時限における考査セル情報を解決する
 */
export function resolveExamCell(
    dateKey: string,
    period: number,
    exams: ExamTimetableRow[] | undefined,
    subjectChoices: Record<string, string> | undefined,
    mapping?: Record<string, string>
): ExamCellResolution | null {
    if (!exams || exams.length === 0) return null;

    // 当該日付・時限の考査行を抽出
    const periodExams = exams.filter(
        (e) => e.dates === dateKey && Number(e.periods) === period
    );

    if (periodExams.length === 0) return null;

    const userChoiceList = Object.values(subjectChoices ?? {}).filter(Boolean);
    const safeMapping = mapping ?? {};

    // 1. 当該時限に複数の考査がある場合（同じ時間に複数の科目があるとき）
    if (periodExams.length > 1) {
        // ユーザーが選択している科目と合致する考査をすべて抽出
        const matchedExams = periodExams.filter((e) =>
            isUserSelectedExam(e.subjects, userChoiceList, safeMapping)
        );

        // 理科演習L（物理L, 化学L, 生物L, 地学L）の判定
        const isPeriodScienceL = periodExams.some((e) => getScienceLAbbr(e.subjects) !== null);

        // ユーザーの選択科目から理科L略称（物L, 化L, 生L, 地L）を抽出（重複排除＆物化生地順）
        const userScienceAbbrs = Array.from(
            new Set(
                userChoiceList
                    .map(getScienceLAbbr)
                    .filter((abbr): abbr is ScienceLAbbr => abbr !== null)
            )
        ).sort((a, b) => SCIENCE_L_ORDER.indexOf(a) - SCIENCE_L_ORDER.indexOf(b));

        const matchedScienceAbbrs = Array.from(
            new Set(
                matchedExams
                    .map((e) => getScienceLAbbr(e.subjects))
                    .filter((abbr): abbr is ScienceLAbbr => abbr !== null)
            )
        ).sort((a, b) => SCIENCE_L_ORDER.indexOf(a) - SCIENCE_L_ORDER.indexOf(b));

        const effectiveScienceAbbrs =
            matchedScienceAbbrs.length >= 2
                ? matchedScienceAbbrs
                : isPeriodScienceL && userScienceAbbrs.length >= 2
                ? userScienceAbbrs
                : matchedScienceAbbrs;

        // 複数理科L科目を履修している場合: 例「物L/化L」のように表示
        if (effectiveScienceAbbrs.length >= 2) {
            const relevantExams = periodExams.filter((e) => {
                const abbr = getScienceLAbbr(e.subjects);
                return abbr && effectiveScienceAbbrs.includes(abbr);
            });

            const activeExams = matchedExams.length >= 2 ? matchedExams : relevantExams;

            const rooms = Array.from(
                new Set(
                    activeExams
                        .map((e) => e.classroom?.trim())
                        .filter(Boolean)
                )
            );

            const firstExam = activeExams[0] ?? periodExams[0];

            return {
                exam: firstExam,
                allExams: activeExams,
                isSelected: true,
                displaySubject: effectiveScienceAbbrs.join("/"),
                startTime: firstExam.start_time || "",
                endTime: firstExam.end_time && firstExam.end_time !== "-" ? firstExam.end_time : "",
                classroom: rooms.length > 0 ? rooms.join("/") : "-",
            };
        }

        // 理科Lが単一選択、または通常科目の場合
        if (matchedExams.length > 0) {
            const firstMatched = matchedExams[0];
            return {
                exam: firstMatched,
                allExams: matchedExams,
                isSelected: true,
                displaySubject: firstMatched.subjects,
                startTime: firstMatched.start_time || "",
                endTime: firstMatched.end_time && firstMatched.end_time !== "-" ? firstMatched.end_time : "",
                classroom: firstMatched.classroom ?? "-",
            };
        }

        // ユーザーがこの時限のどの科目も選択していない場合：
        // 代表として先頭の考査を用い、非選択（灰色）として表示
        const firstExam = periodExams[0];

        return {
            exam: firstExam,
            allExams: [firstExam],
            isSelected: false,
            displaySubject: firstExam.subjects,
            startTime: firstExam.start_time || "",
            endTime: firstExam.end_time && firstExam.end_time !== "-" ? firstExam.end_time : "",
            classroom: firstExam.classroom ?? "-",
        };
    }

    // 2. 当該時限に考査が1つの場合
    const singleExam = periodExams[0];
    const isElective = isElectiveExamSubject(singleExam.subjects, safeMapping);

    if (isElective) {
        // 選択科目の場合：ユーザーがその科目を選択しているか判定
        const isSelected = isUserSelectedExam(singleExam.subjects, userChoiceList, safeMapping);

        return {
            exam: singleExam,
            allExams: [singleExam],
            isSelected,
            displaySubject: singleExam.subjects,
            startTime: singleExam.start_time || "",
            endTime: singleExam.end_time && singleExam.end_time !== "-" ? singleExam.end_time : "",
            classroom: singleExam.classroom ?? "-",
        };
    }

    // 3. 必修科目の場合（全員が受ける科目）
    return {
        exam: singleExam,
        allExams: [singleExam],
        isSelected: true,
        displaySubject: singleExam.subjects,
        startTime: singleExam.start_time || "",
        endTime: singleExam.end_time && singleExam.end_time !== "-" ? singleExam.end_time : "",
        classroom: singleExam.classroom ?? "-",
    };
}

