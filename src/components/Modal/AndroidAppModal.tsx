import Modal from "../Modal";
import type { ModalType } from "../../types/type";
import AndroidInstallGuide from "../AndroidInstallGuide";

type Props = ModalType;

export default function AndroidAppModal({ open, onClose }: Props) {
    return (
        <Modal open={open} onClose={onClose} title="Android版時間割アプリ" blocking={false}>
            <div style={{ textAlign: "left", fontSize: "13.5px", lineHeight: "1.6" }}>
                <p style={{ margin: "0 0 12px", fontWeight: 600 }}>
                    ついにAndroid版時間割アプリがリリース！
                    ネイティブアプリだからこそ可能になった新機能で、時間割確認の手間を大幅削減します！
                    <br />
                    ※ほとんどAIによる開発のため、不具合が多発する恐れがあります
                </p>

                <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>新機能一覧：</div>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                        <li>毎朝設定した時間（デフォルト7:00）に、時間割の通知が届きます</li>
                        <li>時間割が確認できるウィジェットと、行事・メモが確認できるウィジェットの二つを用意</li>
                        <li>行事・メモを検索して、マッチした日付にジャンプできるようになりました</li>
                        <li>科目を色分けしてより視覚的なサポート</li>
                    </ul>
                </div>

                <AndroidInstallGuide />
            </div>

            <button className="close-modal" onClick={onClose} style={{ marginTop: "16px" }}>
                閉じる
            </button>
        </Modal>
    );
}
