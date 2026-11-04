import { useState, useEffect } from "react";
import { useCachedCSV } from "./useCachedCSV";
import { ANDROID_RELEASES_URL, ANDROID_APK_URL, ANDROID_LATEST_RELEASE_API } from "@/config/url";
import type { NestedRecord, AndroidReleaseRow } from "@/types/type";
import { getStorage, setStorage } from "@/utils/storage";

function parseAndroidReleaseRows(rows: NestedRecord[]): AndroidReleaseRow[] {
    return rows.map((row) => ({
        ver: typeof row.ver === "string" ? row.ver.trim() : "",
        info: typeof row.info === "string" ? row.info.trim() : "",
        link: typeof row.link === "string" ? row.link.trim() : "",
    }));
}

function extractReleaseInfo(body?: string): string {
    if (!body || typeof body !== "string") return "";
    const trimmed = body.trim();
    if (!trimmed) return "";

    // 自動生成された "Full Changelog: https://..." のみで構成されている場合は更新内容なし（空白）とする
    const withoutChangelog = trimmed
        .replace(/\*\*Full Changelog\*\*:\s*https?:\/\/\S+/gi, "")
        .replace(/Full Changelog:\s*https?:\/\/\S+/gi, "")
        .replace(/https?:\/\/github\.com\/\S+\/compare\/\S+/gi, "")
        .trim();

    return withoutChangelog;
}

interface GitHubLatestReleaseData {
    version: string;
    info: string;
    downloadUrl: string;
}

const STORAGE_KEY_GITHUB_RELEASE = "android_github_latest_release";

/**
 * Android版アプリの最新リリース情報（バージョン、更新内容、ダウンロードURL）を取得するフック。
 * GitHub Releases APIから最新バージョンとAPK URLを自動取得し、更新内容（body）があれば表示、なければ空白とします。
 * オフライン時やレート制限時はローカルキャッシュおよびスプレッドシートCSVをフォールバックとして利用します。
 */
export function useAndroidAppRelease() {
    // スプレッドシートCSV（フォールバック用）
    const releases = useCachedCSV<AndroidReleaseRow[]>({
        cacheKey: "androidReleases",
        url: ANDROID_RELEASES_URL,
        parse: parseAndroidReleaseRows,
        fallback: () => [],
        errorLabel: "Android版アプリのリリース情報の読み込みに失敗しました",
    });

    // GitHub Releases API から取得した最新データ（キャッシュ優先）
    const [ghRelease, setGhRelease] = useState<GitHubLatestReleaseData | null>(() => {
        return getStorage<GitHubLatestReleaseData>(STORAGE_KEY_GITHUB_RELEASE) ?? null;
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchLatestGitHubRelease() {
            try {
                const res = await fetch(ANDROID_LATEST_RELEASE_API, {
                    headers: {
                        Accept: "application/vnd.github.v3+json",
                    },
                });

                if (!res.ok) return;

                const data = await res.json();
                if (!data || !data.tag_name) return;

                const rawTag = String(data.tag_name).trim();
                const version = rawTag.replace(/^v/, "");

                // assets 内から .apk ファイルを探す
                let downloadUrl = "";
                if (Array.isArray(data.assets)) {
                    const apkAsset = data.assets.find(
                        (a: { name?: string; browser_download_url?: string }) =>
                            typeof a.name === "string" && a.name.endsWith(".apk")
                    );
                    if (apkAsset && typeof apkAsset.browser_download_url === "string") {
                        downloadUrl = apkAsset.browser_download_url.trim();
                    }
                }

                if (!downloadUrl) {
                    downloadUrl = `https://github.com/Neunte0118/TimetableAppsForAndroid/releases/download/${rawTag}/timetable-app-${rawTag}.apk`;
                }

                const info = extractReleaseInfo(data.body);

                const releaseData: GitHubLatestReleaseData = {
                    version,
                    info,
                    downloadUrl,
                };

                if (isMounted) {
                    setGhRelease(releaseData);
                    setStorage(STORAGE_KEY_GITHUB_RELEASE, releaseData);
                }
            } catch {
                // オフラインまたはエラー時は既存キャッシュ/CSVを使用
            }
        }

        fetchLatestGitHubRelease();

        return () => {
            isMounted = false;
        };
    }, []);

    // CSV の先頭データ（フォールバック用）
    const csvLatest = releases && releases.length > 0 ? releases[0] : null;

    // GitHub API > ローカルキャッシュ > スプレッドシートCSV > 定数フォールバック の優先順
    const latestVersion = ghRelease?.version || csvLatest?.ver?.trim() || "";
    const latestInfo = ghRelease ? ghRelease.info : (csvLatest?.info?.trim() || "");
    const downloadUrl = ghRelease?.downloadUrl || csvLatest?.link?.trim() || ANDROID_APK_URL;

    return {
        releases: releases ?? [],
        latestRelease: csvLatest,
        downloadUrl,
        latestVersion,
        latestInfo,
    };
}
