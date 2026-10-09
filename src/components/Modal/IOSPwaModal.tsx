import Modal from "../Modal";
import type { ModalType } from "../../types/type";
import IOSPwaInstallGuide from "../IOSPwaInstallGuide";

type Props = ModalType;

export default function IOSPwaModal({ open, onClose }: Props) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="iPhone向け ホーム画面への追加（PWA）"
            blocking={false}
        >
            <div style={{ textAlign: "left", fontSize: "13.5px", lineHeight: "1.6" }}>
                <p style={{ margin: "0 0 12px", fontWeight: 600 }}>
                    iPhoneでは「ホーム画面に追加」することで、アドレスバーなしの全画面ネイティブアプリ感覚で時間割をご利用いただけます！
                </p>

                <IOSPwaInstallGuide />
            </div>

            <button className="close-modal" onClick={onClose} style={{ marginTop: "16px" }}>
                閉じる
            </button>
        </Modal>
    );
}
