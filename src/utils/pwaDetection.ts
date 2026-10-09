/**
 * PWAおよびiOS端末の判定ユーティリティ
 */

export function isIOSDevice(): boolean {
    if (typeof window === "undefined" || typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    // iPhone / iPad / iPod 判定
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    // iPadOS 13+ (Macintoshとして振る舞うiPad) 判定
    const isIPadOS = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
    return isIOS || isIPadOS;
}

export function isPWAStandalone(): boolean {
    if (typeof window === "undefined") return false;
    // display-mode: standalone 判定
    const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
    // iOS Safari 固有の navigator.standalone 判定
    const isNavigatorStandalone =
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    return isStandaloneMedia || isNavigatorStandalone;
}

export function isIOSPreviewMode(): boolean {
    if (typeof window === "undefined") return false;
    const searchParams = new URLSearchParams(window.location.search);
    return (
        searchParams.get("preview_ios") === "1" ||
        searchParams.get("preview_pwa") === "1" ||
        searchParams.get("test_ios") === "1"
    );
}

export const STORAGE_KEY_IOS_PWA_NEVER_SHOW = "ios_pwa_notice_never_show";

export function shouldShowIOSPwaNotice(): boolean {
    if (typeof window === "undefined") return false;

    // すでにPWA（スタンドアロン）として起動している場合は絶対に表示しない
    if (isPWAStandalone()) return false;

    // 「二度と表示しない」が保存されているかチェック（プレビュー時でも確認可能）
    const neverShow = localStorage.getItem(STORAGE_KEY_IOS_PWA_NEVER_SHOW) === "true";
    if (neverShow) return false;

    // iOS実機、またはテスト確認用パラメータ（?preview_ios=1 など）が付与されている場合に表示
    return isIOSDevice() || isIOSPreviewMode();
}
