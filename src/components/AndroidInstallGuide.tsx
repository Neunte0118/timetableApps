import { useState } from "react";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { useAndroidAppRelease } from "@/hooks/useAndroidAppRelease";

type GuideItem = {
    id: string;
    brand: string;
    intro?: string;
    steps?: string[];
    subSections?: {
        subTitle: string;
        steps: string[];
    }[];
    note?: string;
};

const GUIDES: GuideItem[] = [
    {
        id: "pixel",
        brand: "Google Pixel",
        steps: [
            "「設定」→「アプリ」→「特別なアプリアクセス」→「不明なアプリのインストール」を開く。",
            "APKファイルをダウンロードしたアプリ（通常は「Chrome」または「Files」）を選ぶ。",
            "「この提供元のアプリを許可」をオンにする。",
            "下記のリンクからAPKファイルをダウンロードし、ダウンロードしたAPKファイルを開く。",
            "「この種類のファイルはデバイスに悪影響を与える可能性があります」などの警告が表示された場合は、内容を確認したうえでダウンロードを続行する。",
            "インストール画面が表示されたら、「インストール」を押す。",
            "「Play Protect」による確認画面が表示された場合は、表示内容を確認する。Googleは、Playストア以外から入手したアプリについても安全性を確認しています。",
            "インストールが完了したら、必要に応じて「設定」→「アプリ」→「特別なアプリアクセス」→「不明なアプリのインストール」から、先ほど許可したアプリの許可をオフにする。",
        ],
    },
    {
        id: "galaxy",
        brand: "Galaxy",
        steps: [
            "「設定」→「セキュリティおよびプライバシー」→「その他のセキュリティ設定」→「不明なアプリをインストール」を開く。",
            "APKを開くアプリ（「Chrome」など）を選ぶ。",
            "「この提供元を許可」をオンにする。Samsung公式のGalaxy S26向け案内でもこの経路が示されています。",
            "APKファイルをダウンロードし、開く。",
            "「インストール」を押す。",
            "ここで「インストールできません」などと表示される場合、「設定」→「セキュリティおよびプライバシー」→「自動ブロッカー」を確認する。",
            "「自動ブロッカー」がオンになっている場合、PlayストアやGalaxy Store以外からのアプリをブロックするため、信頼できるAPKであることを確認したうえで、一時的にオフにする。Samsungは、One UI 6.1.1以降の一部端末では自動ブロッカーがデフォルトでオンになっていると案内しています。",
            "もう一度APKファイルを開き、「インストール」を押す。",
            "インストール後、必要に応じて「自動ブロッカー」を再びオンにし、「不明なアプリをインストール」の許可もオフにする。",
        ],
    },
    {
        id: "xiaomi",
        brand: "Xiaomi",
        steps: [
            "「設定」→「追加設定」→「プライバシー」→「特別なアプリアクセス」→「不明なアプリをインストール」を開く。",
            "APKを開くアプリ（「Chrome」など）を選ぶ。",
            "「この提供元を許可」をオンにする。Xiaomi公式サポートでもこの経路が案内されています。",
            "APKファイルをダウンロードする。",
            "ダウンロードしたAPKファイルを開く。",
            "インストール画面が表示されたら、「インストール」を押す。",
            "Play Protectなどの警告が表示された場合は、内容を確認してから操作する。",
            "インストールが終わったら、必要に応じて先ほどの設定画面から「この提供元を許可」をオフにする。",
        ],
    },
    {
        id: "xperia",
        brand: "Xperia",
        subSections: [
            {
                subTitle: "Android 8以降",
                steps: [
                    "APKファイルをダウンロードする。",
                    "ダウンロードしたAPKファイルを開く。",
                    "「セキュリティ上の理由から、お使いのスマートフォンではこの提供元からの不明なアプリをインストールすることはできません」などの表示が出た場合、「設定」を押す。",
                    "「この提供元のアプリを許可」をオンにする。Sony公式でもこの操作が案内されています。",
                    "戻るを押して、もう一度APKファイルを開く。",
                    "「インストール」を押す。",
                    "インストール後は、必要に応じて「この提供元のアプリを許可」をオフにする。",
                ],
            },
            {
                subTitle: "Android 7以前",
                steps: [
                    "「設定」→「セキュリティ」→「提供元不明のアプリ」を開く。",
                    "「提供元不明のアプリ」をオンにする。",
                    "「OK」を押す。",
                    "APKファイルをダウンロードする。",
                    "ダウンロードしたAPKを開く。",
                    "「インストール」を押す。",
                    "インストールが完了したら、セキュリティのため「提供元不明のアプリ」をオフに戻す。Sonyも古いXperiaについてこの方法を案内しています。",
                ],
            },
        ],
    },
    {
        id: "aquos",
        brand: "AQUOS",
        steps: [
            "APKファイルをダウンロードする。",
            "ダウンロードしたAPKファイルを開く。",
            "「この提供元からのアプリをインストールできません」などの表示が出たら、「設定」を押す。",
            "「不明なアプリのインストール」画面で、APKを開いているアプリについて「このソースからのアプリを許可する」をオンにする。",
            "戻るを押す。",
            "「インストール」を押す。シャープのAndroid端末向け資料でも、この流れが案内されています。",
            "インストール後、必要に応じて先ほどの許可をオフにする。",
        ],
    },
    {
        id: "oppo",
        brand: "OPPO",
        intro: "OPPOはColorOSの世代によって設定名が変わるため、端末の設定検索を使う方法が分かりやすいです。",
        steps: [
            "「設定」を開く。",
            "上部の検索欄で「不明なアプリ」または「不明なソース」と検索する。",
            "「不明なアプリのインストール」に相当する項目を開く。",
            "「Chrome」など、APKを開くアプリを選ぶ。",
            "許可をオンにする。",
            "APKをダウンロードする。",
            "APKを開く。",
            "「インストール」を押す。",
            "完了後、必要に応じて許可をオフにする。",
        ],
    },
    {
        id: "oneplus",
        brand: "OnePlus",
        steps: [
            "「設定」を開く。",
            "「アプリ」を開く。",
            "「特別なアプリアクセス」または同様の項目を開く。",
            "「不明なアプリのインストール」を開く。",
            "Chromeなど、APKを開くアプリを選ぶ。",
            "「この提供元を許可」をオンにする。",
            "APKファイルを開く。",
            "「インストール」を押す。",
            "インストール後、必要に応じて許可をオフにする。",
        ],
        note: "OnePlusでも、APKを開いたときに設定画面へ直接移動するタイプの端末があります。",
    },
];

export default function AndroidInstallGuide() {
    const { downloadUrl, latestVersion } = useAndroidAppRelease();

    // 選択中の機種（クリックでトグル）
    const [openBrandId, setOpenBrandId] = useState<string | null>(null);

    const toggleBrand = (id: string) => {
        setOpenBrandId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="android-guide-section">
            <div className="android-guide-header">
                <h4 className="android-section-title">
                    インストール方法
                </h4>
                <p className="android-guide-subtitle">
                    お使いの機種またはアプリを選択すると、詳しいインストール手順(AIが教えてくれたものそのままです)が表示されます。
                </p>
            </div>

            {/* ダウンロードボタン（共通） */}
            <div className="android-guide-download-box">
                <a
                    href={downloadUrl}
                    className="android-download-button"
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                >
                    <Download size={16} />
                    ダウンロード {latestVersion ? `(v${latestVersion})` : ""}
                </a>
            </div>

            {/* 機種選択ボタン一覧 */}
            <div className="android-brand-buttons">
                {GUIDES.map((guide) => {
                    const isOpen = openBrandId === guide.id;
                    return (
                        <button
                            key={guide.id}
                            type="button"
                            className={`android-brand-btn ${isOpen ? "active" : ""}`}
                            onClick={() => toggleBrand(guide.id)}
                            aria-expanded={isOpen}
                        >
                            <span>{guide.brand}</span>
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    );
                })}
            </div>

            {/* 選択された機種の詳細手順 */}
            {GUIDES.map((guide) => {
                if (openBrandId !== guide.id) return null;

                return (
                    <div key={guide.id} className="android-brand-content">
                        <div className="android-brand-content-title">
                            {guide.brand} でのインストール手順
                        </div>

                        {guide.intro && (
                            <p className="android-brand-intro">{guide.intro}</p>
                        )}

                        {guide.steps && (
                            <ol className="android-step-list">
                                {guide.steps.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                ))}
                            </ol>
                        )}

                        {guide.subSections && (
                            <div className="android-subsections">
                                {guide.subSections.map((sub, sIdx) => (
                                    <div key={sIdx} className="android-subsection">
                                        <div className="android-subsection-title">
                                            {sub.subTitle}
                                        </div>
                                        <ol className="android-step-list">
                                            {sub.steps.map((step, idx) => (
                                                <li key={idx}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                ))}
                            </div>
                        )}

                        {guide.note && (
                            <p className="android-brand-note">{guide.note}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
