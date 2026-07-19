import Modal from "../Modal";
import "./UpdateInfoModal.css";

import type { ModalType } from "../../types/type";
import type { NestedRecord } from "../../types/type";

type Props = ModalType & {
    isList: boolean;
    data: NestedRecord[] | undefined;
};

export default function UpdateInfoModal({
    open,
    onClose,
    isList,
    data,
}: Props) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="更新情報"
            blocking={true}
        >
            <div className="update-info-modal">
                {!data && <p>読み込み中…</p>}

                {data && data.length === 0 && <p>更新情報がありません。</p>}

                {data && data.length > 0 && (
                    <>
                        {data.map((item, i) => {
                            const version =
                                typeof item?.versions === "string"
                                    ? item.versions
                                    : "";

                            const date =
                                typeof item?.dates === "string"
                                    ? item.dates
                                    : "";

                            const contents =
                                typeof item?.contents === "string"
                                    ? item.contents
                                    : "";

                            return (
                                <div key={`${version}-${i}`} className="update-info-entry">
                                    <h3>ver. {version}</h3>
                                    <h4>{date}</h4>

                                    <ul>
                                        {contents
                                            .split("\n")
                                            .filter((line) => line.trim() !== "")
                                            .map((line, j) => (
                                                <li key={j}>{line}</li>
                                            ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </>
                )}

                <button
                    className="close-modal"
                    onClick={onClose}
                >
                    閉じる
                </button>
            </div>
        </Modal>
    );
}