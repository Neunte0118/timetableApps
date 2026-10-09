import { useState, useEffect } from "react";
import { X, Share, Smartphone } from "lucide-react";
import "./IOSPwaNoticeBanner.css";
import {
    shouldShowIOSPwaNotice,
    isIOSPreviewMode,
    STORAGE_KEY_IOS_PWA_NEVER_SHOW,
} from "../utils/pwaDetection";

type Props = {
    onOpenIOSGuide?: () => void;
};

export default function IOSPwaNoticeBanner({ onOpenIOSGuide }: Props) {
    const [isVisible, setIsVisible] = useState(false);
    const [neverShowChecked, setNeverShowChecked] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        setIsPreview(isIOSPreviewMode());
        if (shouldShowIOSPwaNotice()) {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) {
        return null;
    }

    const handleClose = () => {
        if (neverShowChecked) {
            localStorage.setItem(STORAGE_KEY_IOS_PWA_NEVER_SHOW, "true");
        }
        setIsVisible(false);
    };

    const handleOpenDetail = (e: React.MouseEvent) => {
        e.preventDefault();
        if (neverShowChecked) {
            localStorage.setItem(STORAGE_KEY_IOS_PWA_NEVER_SHOW, "true");
        }
        setIsVisible(false);
        onOpenIOSGuide?.();
    };

    return (
        <aside
            className="ios-pwa-notice-overlay"
            aria-label="iPhone向けホーム画面追加（PWA）のご案内"
        >
            <div className="ios-pwa-notice-card">
                <button
                    type="button"
                    className="ios-pwa-notice-close-btn"
                    onClick={handleClose}
                    aria-label="閉じる"
                    title="閉じる"
                >
                    <X size={18} />
                </button>

                <div className="ios-pwa-notice-content">
                    <div className="ios-pwa-notice-title-row">
                        <Smartphone size={16} className="ios-pwa-notice-icon" />
                        <p className="ios-pwa-notice-text">
                            iPhoneをお使いの方へ
                        </p>
                        {isPreview && (
                            <span className="ios-pwa-notice-preview-badge">
                                テスト確認中
                            </span>
                        )}
                    </div>

                    <p className="ios-pwa-notice-subtext">
                        ホーム画面に追加すると、Safariのバーが隠れて全画面アプリとして快適にご利用いただけます。
                    </p>

                    <div className="ios-pwa-notice-footer-row">
                        <label className="ios-pwa-notice-checkbox-label">
                            <input
                                type="checkbox"
                                checked={neverShowChecked}
                                onChange={(e) => setNeverShowChecked(e.target.checked)}
                                className="ios-pwa-notice-checkbox"
                            />
                            <span>二度と表示しない</span>
                        </label>

                        <button
                            type="button"
                            className="ios-pwa-notice-action-btn"
                            onClick={handleOpenDetail}
                        >
                            <Share size={12} />
                            追加方法を見る
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
