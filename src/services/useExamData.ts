// services/examCSV.ts
import Papa from "papaparse";

/**
 * CSVの生データ型
 */
type ExamRow = {
  key: string;
  examName: string;
  dates: string;
  displayDates: string;
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
};

/**
 * 最終構造
 */
export type ExamTable = Record<
  string,
  {
    examName: string;
    dates: Record<string, ExamItem[]>;
  }
>;

export async function loadExamTable(url: string): Promise<ExamTable> {
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

function buildExamTable(rows: ExamRow[]): ExamTable {
  return rows.reduce<ExamTable>((acc, row) => {
    const { key, examName, displayDates, dates, subjects, range, assignments } = row;

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
    });

    return acc;
  }, {});
}