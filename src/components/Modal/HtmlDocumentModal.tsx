import Modal from "../Modal";
import type { ModalType } from "../../types/type";
import "./HtmlDocumentModal.css";

type Props = ModalType & {
    title: string;
    html: string;
    blocking?: boolean;
};

export default function HtmlDocumentModal({
    open,
    onClose,
    title,
    html,
    blocking = false,
}: Props) {
    return (
        <Modal open={open} onClose={onClose} title={title} blocking={blocking}>
            <div className="html-document-modal">
                <div
                    className="html-document-frame"
                    dangerouslySetInnerHTML={{ __html: html }}
                />

                <button className="close-modal" onClick={onClose}>
                    閉じる
                </button>
            </div>
        </Modal>
    );
}
