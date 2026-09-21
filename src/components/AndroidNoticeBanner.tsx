import { useState, useEffect } from "react";
import { X, Smartphone } from "lucide-react";
import "./AndroidNoticeBanner.css";

const STORAGE_KEY_NEVER_SHOW = "android_app_notice_never_show";
// 互換性のため古いストレージキーもチェック
const STORAGE_KEY_OLD_DISMISSED = "android_app_notice_dismissed_v1";

type Props = {
    onOpenAndroidApp?: () => void;
};

export default function AndroidNoticeBanner({ onOpenAndroidApp }: Props) {
    const [isVisible, setIsVisible] = useState(false);
    const [neverShowChecked, setNeverShowChecked] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Android端末判定（またはデバッグ・テスト用の ?preview_android=1 パラメータ）
        const ua = navigator.userAgent || "";
        const checkAndroid = /android/i.test(ua);
        const searchParams = new URLSearchParams(window.location.search);
        const forcePreview = searchParams.get("preview_android") === "1";

        if (checkAndroid || forcePreview) {
            const neverShow =
                localStorage.getItem(STORAGE_KEY_NEVER_SHOW) === "true" ||
                localStorage.getItem(STORAGE_KEY_OLD_DISMISSED) === "true";

            if (!neverShow) {
                setIsVisible(true);
            }
        }
    }, []);

    if (!isVisible) {
        return null;
    }

    const handleClose = () => {
        if (neverShowChecked) {
            localStorage.setItem(STORAGE_KEY_NEVER_SHOW, "true");
        }
        setIsVisible(false);
    };

    const handleOpenDetail = (e: React.MouseEvent) => {
        e.preventDefault();
        if (neverShowChecked) {
            localStorage.setItem(STORAGE_KEY_NEVER_SHOW, "true");
        }
        setIsVisible(false);
        onOpenAndroidApp?.();
    };

    return (
        <aside
            className="android-notice-overlay"
            aria-label="Android版アプリアナウンス"
        >
            <div className="android-notice-card">
                <button
                    type="button"
                    className="android-notice-close-btn"
                    onClick={handleClose}
                    aria-label="閉じる"
                    title="閉じる"
                >
                    <X size={18} />
                </button>

                <div className="android-notice-content">
                    <div className="android-notice-title-row">
                        <Smartphone size={16} className="android-notice-icon" />
                        <p className="android-notice-text">
                            Android版時間割アプリがリリースされました！
                        </p>
                    </div>

                    <p className="android-notice-subtext">
                        詳細は
                        {onOpenAndroidApp ? (
                            <button
                                type="button"
                                className="android-notice-link-btn"
                                onClick={handleOpenDetail}
                            >
                                「その他&gt;Android版アプリ」
                            </button>
                        ) : (
                            <span>「その他&gt;Android版アプリ」</span>
                        )}
                        をご覧ください。
                    </p>

                    <label className="android-notice-checkbox-label">
                        <input
                            type="checkbox"
                            checked={neverShowChecked}
                            onChange={(e) => setNeverShowChecked(e.target.checked)}
                            className="android-notice-checkbox"
                        />
                        <span>二度と表示しない</span>
                    </label>
                </div>
            </div>
        </aside>
    );
}
