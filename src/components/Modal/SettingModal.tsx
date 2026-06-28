import Modal from "../Modal";
import type { ModalType } from "../../types/type";

type Props = ModalType & {
    onOpen: (modalType: string) => void;
};

export default function SettingModal({ open, onClose, onOpen }: Props) {
    const openAndClose = (modalType: string) => {
        onOpen(modalType);
    };

    return (
        <Modal open={open} onClose={onClose} title="その他" blocking={false}>
            <div className="settings-menu">
                <button type="button" onClick={() => openAndClose("class")}>
                    クラスを変更
                </button>
                <button type="button" onClick={() => openAndClose("subject")}>
                    選択科目を変更
                </button>
                <button type="button" onClick={() => openAndClose("updateInfo")}>
                    更新履歴
                </button>
                <button type="button" onClick={() => openAndClose("help")}>
                    ヘルプ
                </button>
                <button type="button" onClick={() => window.open("https://forms.gle/KiiEAds2vtjAmsZ97", "_blank", "noopener,noreferrer")}>
                    不具合の報告↗
                </button>
                <button type="button" onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSfTOKMLJz896qfq7OKSv7TRwxxJxX4VIqXT4npLcGmqWNyBkg/viewform?usp=preview", "_blank", "noopener,noreferrer")}>
                    時間割変更↗
                </button>
                <button type="button" onClick={() => openAndClose("term")}>
                    利用規約
                </button>
                <button type="button" onClick={() => openAndClose("source")}>
                    ソース
                </button>
            </div>
            <button className="close-modal" onClick={onClose}>
                閉じる
            </button>
        </Modal>
    );
}
