import type { ExamTimetableRow } from "../types/type";

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
        // ユーザーが選択している科目と合致するものを探す
        const matchedExam = periodExams.find((e) =>
            isUserSelectedExam(e.subjects, userChoiceList, safeMapping)
        );

        if (matchedExam) {
            // 選択している科目のみを表示
            return {
                exam: matchedExam,
                isSelected: true,
                displaySubject: matchedExam.subjects,
                startTime: matchedExam.start_time || "",
                endTime: matchedExam.end_time && matchedExam.end_time !== "-" ? matchedExam.end_time : "",
                classroom: matchedExam.classroom ?? "-",
            };
        }

        // ユーザーがこの時限のどの科目も選択していない場合：
        // 代表として先頭の考査を用い、非選択（灰色）として表示
        const firstExam = periodExams[0];

        return {
            exam: firstExam,
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
        isSelected: true,
        displaySubject: singleExam.subjects,
        startTime: singleExam.start_time || "",
        endTime: singleExam.end_time && singleExam.end_time !== "-" ? singleExam.end_time : "",
        classroom: singleExam.classroom ?? "-",
    };
}

