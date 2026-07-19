import Modal from "../Modal";
import "./UpdateInfoModal.css";

import type { ModalType, UpdateInfoRow } from "../../types/type";

type Props = ModalType & {
    data: UpdateInfoRow[] | undefined;
};

export default function UpdateInfoModal({ open, onClose, data }: Props) {
    return (
        <Modal open={open} onClose={onClose} title="更新情報" blocking={true}>
            <div className="update-info-modal">
                {!data && <p>読み込み中…</p>}

                {data && data.length === 0 && <p>更新情報がありません。</p>}

                {data && data.length > 0 && (
                    <>
                        {data.map((item, i) => (
                            <div key={`${item.versions}-${i}`} className="update-info-entry">
                                <h3>ver. {item.versions}</h3>
                                <h4>{item.dates}</h4>

                                <ul>
                                    {item.contents
                                        .split("\n")
                                        .filter((line) => line.trim() !== "")
                                        .map((line, j) => (
                                            <li key={j}>{line}</li>
                                        ))}
                                </ul>
                            </div>
                        ))}
                    </>
                )}

                <button className="close-modal" onClick={onClose}>
                    閉じる
                </button>
            </div>
        </Modal>
    );
}
