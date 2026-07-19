import Papa from "papaparse";

/**
 * CSVの生データ型
 */
type ExamRow = {
    key: string;
    examName: string;
    dates: string;
    displayDates: string;
    periods: string;
    subjects: string;
    range: string;
    assignments: string;
};

/**
 * 日付ごとの最小データ
 */
type ExamItem = {
    dates: string;
    subjects: string;
    range: string;
    assignments: string;
    periods: number;
};

/**
 * 最終構造
 */
export type ExamDataType = Record<
    string,
    {
        examName: string;
        dates: Record<string, ExamItem[]>;
    }
>;

export async function loadExamTable(url: string): Promise<ExamDataType> {
    const rows = await fetchExamCSV(url);
    return buildExamTable(rows);
}

async function fetchExamCSV(url: string): Promise<ExamRow[]> {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`CSV取得失敗: ${res.status}`);
    }

    const text = await res.text();

    const result = Papa.parse<ExamRow>(text, {
        header: true,
        skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
        throw new Error(result.errors[0].message);
    }

    return result.data;
}

function buildExamTable(rows: ExamRow[]): ExamDataType {
    return rows.reduce<ExamDataType>((acc, row) => {
        const { key, examName, displayDates, dates, periods, subjects, range, assignments } = row;

        if (!acc[key]) {
            acc[key] = {
                examName,
                dates: {},
            };
        }

        if (!acc[key].dates[displayDates]) {
            acc[key].dates[displayDates] = [];
        }

        acc[key].dates[displayDates].push({
            dates,
            subjects,
            range,
            assignments,
            periods: Number(periods),
        });

        acc[key].dates[displayDates].sort((a, b) => a.periods - b.periods);

        return acc;
    }, {});
}
