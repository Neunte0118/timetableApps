import { useCachedCSV } from "./useCachedCSV";
import { ANDROID_RELEASES_URL, ANDROID_APK_URL } from "@/config/url";
import type { NestedRecord, AndroidReleaseRow } from "@/types/type";

function parseAndroidReleaseRows(rows: NestedRecord[]): AndroidReleaseRow[] {
    return rows.map((row) => ({
        ver: typeof row.ver === "string" ? row.ver.trim() : "",
        info: typeof row.info === "string" ? row.info.trim() : "",
        link: typeof row.link === "string" ? row.link.trim() : "",
    }));
}

/**
 * Android版アプリの最新リリース情報（バージョン、更新内容、ダウンロードURL）を取得するフック。
 * CSVの1行目（最新）のlinkを取得し、もし取得できなければ既存の定数 ANDROID_APK_URL をフォールバックとして返す。
 */
export function useAndroidAppRelease() {
    const releases = useCachedCSV<AndroidReleaseRow[]>({
        cacheKey: "androidReleases",
        url: ANDROID_RELEASES_URL,
        parse: parseAndroidReleaseRows,
        fallback: () => [],
        errorLabel: "Android版アプリのリリース情報の読み込みに失敗しました",
    });

    const latestRelease = releases && releases.length > 0 ? releases[0] : null;
    const downloadUrl = latestRelease?.link?.trim() ? latestRelease.link.trim() : ANDROID_APK_URL;
    const latestVersion = latestRelease?.ver?.trim() || "";
    const latestInfo = latestRelease?.info?.trim() || "";

    return {
        releases: releases ?? [],
        latestRelease,
        downloadUrl,
        latestVersion,
        latestInfo,
    };
}
