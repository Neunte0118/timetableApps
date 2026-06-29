import { getStorage, setStorage } from "@/utils/storage";
import { fetchCSV } from "./fetchCSV";
import { NestedRecord } from "@/types/type";

export async function fetchCSVWithCache(
    key: string,
    url: string,
    onCached?: (data: NestedRecord[]) => void
): Promise<NestedRecord[]> {

    // 1. キャッシュがあれば即表示
    const cached = getStorage<NestedRecord[]>(key);
    if (cached) {
        onCached?.(cached);
    }

    // 2. 最新データ取得
    const latest = await fetchCSV(url);

    setStorage(key, latest);

    return latest;
}