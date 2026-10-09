import { Share, PlusSquare } from "lucide-react";
import "./IOSPwaInstallGuide.css";

export default function IOSPwaInstallGuide() {
    return (
        <div className="ios-pwa-guide">
            <div>
                <div className="ios-pwa-section-title">
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
                                右上の「追加」をタップして完了
                            </div>
                            <p className="ios-pwa-step-desc">
                                画面右上の「追加」をタップすると、ホーム画面に時間割アプリのアイコンが作成されます。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
