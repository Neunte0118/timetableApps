/*
import Papa from "papaparse";

export async function fetchCSV(url: string): Promise<Record<string, string>[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CSVの取得に失敗しました: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(`CSVの解析に失敗しました: ${result.errors[0].message}`);
  }

  console.log(result.data);

  return result.data;
}
*/


import Papa from "papaparse";
import type { NestedRecord } from "../types/type";

type PathSegment = string | number;

type Row = {
  key: string;
  examName: string;
  dates: string;
  displayDates: string;
  subjects: string;
  range: string;
  assignments: string;
};

type RowData = {
  dates: string;
  subjects: string;
  range: string;
  assignments: string;
};

export function groupByKeyAndDate(rows: Row[]) {
  return rows.reduce<Record<string, {
    examName: string;
    dates: Record<string, RowData[]>;
  }>>((acc, row) => {

    const {
      key,
      examName,
      displayDates,
      ...rest
    } = row;

    // 初期化
    if (!acc[key]) {
      acc[key] = {
        examName,
        dates: {}
      };
    }

    // 日付キー
    if (!acc[key].dates[displayDates]) {
      acc[key].dates[displayDates] = [];
    }

    acc[key].dates[displayDates].push(rest);

    return acc;
  }, {});
}

type RowWithoutKey = Omit<Row, "key">;

export function groupByKey(rows: Row[]): Record<string, RowWithoutKey> {
  return rows.reduce<Record<string, RowWithoutKey>>((acc, row) => {
    const { key, ...value } = row;
    acc[key] = value;
    return acc;
  }, {});
}

function parsePath(key: string): PathSegment[] {
    const segments: PathSegment[] = [];

    for (const part of key.split(".")) {
        const re = /([^\[\]]+)|\[(\d+)\]/g;
        let match: RegExpExecArray | null;

        while ((match = re.exec(part)) !== null) {
            if (match[1]) {
                segments.push(match[1]);
            } else if (match[2]) {
                segments.push(Number(match[2]));
            }
        }
    }

    return segments;
}

function setDeep(
    target: NestedRecord,
    path: PathSegment[],
    value: unknown
): void {
    let current: any = target;

    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        const last = i === path.length - 1;
        const next = path[i + 1];

        if (last) {
            current[key as any] = value;
            return;
        }

        if (
            current[key as any] === undefined ||
            typeof current[key as any] !== "object"
        ) {
            current[key as any] =
                typeof next === "number" ? [] : {};
        }

        current = current[key as any];
    }
}

function rowToNestedObject(
    row: Record<string, string>
): NestedRecord {
    const result: NestedRecord = {};

    for (const [key, value] of Object.entries(row)) {
        if (!key.trim()) continue;

        setDeep(result, parsePath(key), value);
    }

    return result;
}

export async function fetchCSV(
    url: string
): Promise<NestedRecord[]> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `CSVの取得に失敗しました: ${response.status}`
        );
    }

    const text = await response.text();

    const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
        throw new Error(result.errors[0].message);
    }
    return result.data.map(rowToNestedObject);
}

