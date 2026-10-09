import { useState, useEffect } from "react";
import { Share, PlusSquare, CheckCircle, Smartphone, Info, RefreshCw } from "lucide-react";
import "./IOSPwaInstallGuide.css";
import {
    isIOSDevice,
    isPWAStandalone,
    isIOSPreviewMode,
    STORAGE_KEY_IOS_PWA_NEVER_SHOW,
} from "../utils/pwaDetection";

export default function IOSPwaInstallGuide() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [resetDone, setResetDone] = useState(false);

    useEffect(() => {
        setIsIOS(isIOSDevice());
        setIsStandalone(isPWAStandalone());
        setIsPreview(isIOSPreviewMode());
    }, []);

    const handleResetNeverShow = () => {
        localStorage.removeItem(STORAGE_KEY_IOS_PWA_NEVER_SHOW);
        setResetDone(true);
        window.setTimeout(() => setResetDone(false), 2500);
    };

    return (
        <div className="ios-pwa-guide">
            <div className="ios-pwa-features">
                <div className="ios-pwa-feature-card">
                    <Smartphone size={16} className="ios-pwa-feature-icon" />
                    <div>
                        <div className="ios-pwa-feature-title">全画面で広々表示</div>
                        <p className="ios-pwa-feature-desc">
                            SafariのURLバーやツールバーが非表示になり、時間割が画面いっぱいに広く見やすくなります。
                        </p>
                    </div>
                </div>

                <div className="ios-pwa-feature-card">
                    <CheckCircle size={16} className="ios-pwa-feature-icon" />
                    <div>
                        <div className="ios-pwa-feature-title">ホームからワンタップ</div>
                        <p className="ios-pwa-feature-desc">
                            ホーム画面のアプリアイコンから、いつでも素早く時間割にアクセスできます。
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <div style={{ fontWeight: 700, marginBottom: "8px", color: "var(--text-strong-color)" }}>
                    ホーム画面への追加手順（Safari）
                </div>

                <div className="ios-pwa-steps">
                    <div className="ios-pwa-step-card">
                        <div className="ios-pwa-step-num">1</div>
                        <div className="ios-pwa-step-content">
                            <div className="ios-pwa-step-title">
                                Safariの「共有」ボタンをタップ
                            </div>
                            <p className="ios-pwa-step-desc">
                                Safari画面下部の中央にある共有アイコン（
                                <span className="ios-pwa-inline-badge">
                                    <Share size={12} /> 共有
                                </span>
                                ）をタップします。
                            </p>
                            <p className="ios-pwa-step-note">
                                ※Chrome等の他ブラウザをお使いの場合は、Safariでこのページを開いてください。
                            </p>
                        </div>
                    </div>

                    <div className="ios-pwa-step-card">
                        <div className="ios-pwa-step-num">2</div>
                        <div className="ios-pwa-step-content">
                            <div className="ios-pwa-step-title">
                                「ホーム画面に追加」を選択
                            </div>
                            <p className="ios-pwa-step-desc">
                                表示された共有メニューを下にスクロールし、
                                <span className="ios-pwa-inline-badge">
                                    <PlusSquare size={12} /> ホーム画面に追加
                                </span>
                                をタップします。
                            </p>
                        </div>
                    </div>

                    <div className="ios-pwa-step-card">
                        <div className="ios-pwa-step-num">3</div>
                        <div className="ios-pwa-step-content">
                            <div className="ios-pwa-step-title">
                                右上の「追加」をタップして完了！
                            </div>
                            <p className="ios-pwa-step-desc">
                                画面右上の「追加」をタップすると、ホーム画面に時間割アプリアイコンが作成されます。
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* テスト確認・環境情報ボックス */}
            <div className="ios-pwa-status-box">
                <div className="ios-pwa-status-title">
                    <Info size={14} />
                    現在の動作・判定状況（テスト確認用）
                </div>

                <div className="ios-pwa-status-row">
                    <span>端末種別:</span>
                    <strong>{isIOS ? "iOS (iPhone/iPad)" : "PC / Android等の他端末"}</strong>
                </div>

                <div className="ios-pwa-status-row">
                    <span>動作環境:</span>
                    <strong>
                        {isStandalone ? "PWA（ホーム画面から起動中）" : "ブラウザタブ表示（非PWA）"}
                    </strong>
                </div>

                <div className="ios-pwa-status-row">
                    <span>テスト確認パラメータ:</span>
                    <strong>{isPreview ? "有効（?preview_ios=1）" : "なし（通常）"}</strong>
                </div>

                <div style={{ marginTop: "4px", opacity: 0.85, fontSize: "11px", lineHeight: "1.4" }}>
                    ※iPhone以外の端末でも、URLに <code>?preview_ios=1</code> を付けることでiPhone向けバナーをいつでもテスト表示できます。
                </div>

                <button
                    type="button"
                    className="ios-pwa-reset-btn"
                    onClick={handleResetNeverShow}
                >
                    <RefreshCw size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: "4px" }} />
                    {resetDone ? "バナー非表示設定を解除しました！" : "「二度と表示しない」設定をリセット（テスト用）"}
                </button>
            </div>
        </div>
    );
}
