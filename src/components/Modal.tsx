import { ReactNode, useEffect } from "react";
import "../index.css";
import "./Modal.css";

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    blocking: boolean;
};

export default function Modal({ open, onClose, title, children, blocking }: Props) {
    // blocking な（利用規約同意前など）モーダルは ESC で閉じさせない
    useEffect(() => {
        if (!open || blocking) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, blocking, onClose]);

    if (!open) return null;

    return (
        <div className="modal show" onClick={blocking ? undefined : onClose}>
            <div className="modal-content">
                <h2 className="modal-title">{title}</h2>
                <div className="modal-body" onClick={(e) => e.stopPropagation()}>
                    {children}
                </div>
            </div>
        </div>
    );
}
