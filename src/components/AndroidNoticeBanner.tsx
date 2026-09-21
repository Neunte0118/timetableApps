import { useState, useEffect } from "react";
import { Smartphone, ChevronDown, ChevronUp, X } from "lucide-react";
import AndroidInstallGuide from "./AndroidInstallGuide";
import "./AndroidNoticeBanner.css";

const STORAGE_KEY_DISMISSED = "android_app_notice_dismissed_v1";

export default function AndroidNoticeBanner() {
    const [isAndroid, setIsAndroid] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDismissed, setIsDismissed] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Android端末判定（またはデバッグ用 ?preview_android=1 パラメータ）
        const ua = navigator.userAgent || "";
        const checkAndroid = /android/i.test(ua);
        const searchParams = new URLSearchParams(window.location.search);
        const forcePreview = searchParams.get("preview_android") === "1";

        if (checkAndroid || forcePreview) {
            setIsAndroid(true);
            const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED) === "true";
            setIsDismissed(dismissed);
        }
    }, []);

    if (!isAndroid || isDismissed) {
        return null;
    }

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDismissed(true);
        localStorage.setItem(STORAGE_KEY_DISMISSED, "true");
    };

    return (
        <aside
            className={`android-notice-container ${isExpanded ? "expanded" : ""}`}
            aria-label="Android版アプリアナウンス"
        >
            {/* コンパクトな常時表示ヘッダー（大々的ではない控えめなバナー） */}
            <div
                className="android-notice-bar"
                onClick={() => setIsExpanded((prev) => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsExpanded((prev) => !prev);
                    }
                }}
            >
                <div className="android-notice-left">
                    <span className="android-badge">
                        <Smartphone size={13} className="android-badge-icon" />
                        Android
                    </span>
                    <span className="android-notice-summary">
                        Android版時間割アプリがリリースされました
                    </span>
                </div>

                <div className="android-notice-actions">
                    <button
                        type="button"
                        className="android-toggle-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded((prev) => !prev);
                        }}
                    >
                        {isExpanded ? (
                            <>
                                閉じる <ChevronUp size={15} />
                            </>
                        ) : (
                            <>
                                詳細・ダウンロード <ChevronDown size={15} />
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="android-close-btn"
                        title="お知らせを非表示にする"
                        aria-label="お知らせを非表示にする"
                        onClick={handleDismiss}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* 詳細展開エリア（クリックで開く） */}
            {isExpanded && (
                <div className="android-notice-details">
                    <p className="android-lead-text">
                        ついにAndroid版時間割アプリがリリース！
                        ネイティブアプリだからこそ可能になった新機能で、時間割確認の手間を大幅削減します！
                        <br />
                        ※ほとんどAIによる開発なので、不具合が発生する恐れがあります
                    </p>

                    <div className="android-section">
                        <h4 className="android-section-title">新機能一覧：</h4>
                        <ul className="android-feature-list">
                            <li>毎朝設定した時間（デフォルト7:00）に、時間割の通知が届きます</li>
                            <li>時間割が確認できるウィジェットと、行事・メモが確認できるウィジェットの二つを用意</li>
                            <li>行事・メモを検索して、マッチした日付にジャンプできるようになりました</li>
                            <li>科目を色分けしてより視覚的なサポート</li>
                        </ul>
                    </div>

                    <AndroidInstallGuide />
                </div>
            )}
        </aside>
    );
}
