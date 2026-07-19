import Papa from "papaparse";
import type { NestedRecord } from "../types/type";

type PathSegment = string | number;

/**
 * "a.b[0].c" のようなヘッダー名をパスセグメント列に変換する。
 * 例: "dates" -> ["dates"], "items[0].name" -> ["items", 0, "name"]
 */
function parsePath(key: string): PathSegment[] {
    const segments: PathSegment[] = [];

    for (const part of key.split(".")) {
        const re = /([^[\]]+)|\[(\d+)\]/g;
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

function setDeep(target: NestedRecord, path: PathSegment[], value: unknown): void {
    let current: any = target;

    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        const last = i === path.length - 1;
        const next = path[i + 1];

        if (last) {
            current[key as any] = value;
            return;
        }

        if (current[key as any] === undefined || typeof current[key as any] !== "object") {
            current[key as any] = typeof next === "number" ? [] : {};
        }

        current = current[key as any];
    }
}

function rowToNestedObject(row: Record<string, string>): NestedRecord {
    const result: NestedRecord = {};

    for (const [key, value] of Object.entries(row)) {
        if (!key.trim()) continue;
        setDeep(result, parsePath(key), value);
    }

    return result;
}

/**
 * CSV URLを取得し、ヘッダーのドット/角括弧記法をネストしたオブジェクトに
 * 変換して返す。ヘッダーに "a.b" や "items[0]" のような記法がなければ
 * 単純なフラットオブジェクトの配列として扱える。
 */
export async function fetchCSV(url: string): Promise<NestedRecord[]> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`CSVの取得に失敗しました: ${response.status} (${url})`);
    }

    const text = await response.text();

    const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
        throw new Error(`CSVの解析に失敗しました: ${result.errors[0].message}`);
    }

    return result.data.map(rowToNestedObject);
}
