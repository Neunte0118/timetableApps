import { useEffect, useState } from "react";
import { fetchCSV } from "../services/fetchCSV";
import { getStorage, setStorage } from "../utils/storage";
import { logger } from "../utils/logger";
import type { NestedRecord } from "../types/type";

const log = logger.scope("useCachedCSV");

type Options<T> = {
    /** localStorage に保存するキー */
    cacheKey: string;
    /** 取得先CSVのURL */
    url: string;
    /** CSV行 (NestedRecord[]) をアプリ内部の型に変換する */
    parse: (rows: NestedRecord[]) => T;
    /** キャッシュも取得も失敗した場合のフォールバック値を返す */
    fallback: () => T;
    /** エラー時にログへ出す説明文（日本語） */
    errorLabel?: string;
};

/**
 * 「キャッシュを先に表示 → 最新データを取得 → 成功したら上書き保存 →
 * 失敗時はキャッシュがあればそのまま、無ければ fallback」という
 * 各種 useXxxData フックで繰り返されていたパターンを共通化したフック。
 */
export function useCachedCSV<T>({ cacheKey, url, parse, fallback, errorLabel }: Options<T>) {
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const cached = getStorage<T>(cacheKey);
            if (cached && !cancelled) {
                setData(cached);
            }

            try {
                const rows = await fetchCSV(url);
                const parsed = parse(rows);

                if (cancelled) return;

                setData(parsed);
                setStorage(cacheKey, parsed);
            } catch (e) {
                log.error(errorLabel ?? `${cacheKey} の読み込みに失敗しました`, e);

                if (cancelled) return;

                if (!getStorage<T>(cacheKey)) {
                    setData(fallback());
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
        // url/parse/fallback は呼び出し側で毎回新しい参照になりがちなため、
        // cacheKey と url の変化のみを依存とする（実質的に固定URL運用のため妥当）
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey, url]);

    return data;
}
