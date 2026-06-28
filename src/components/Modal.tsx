import { ReactNode } from "react";
import "../index.css";
import "./Modal.css";

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    blocking: boolean;
}

export default function Modal({open, onClose, title, children, blocking}: Props) {
    if (!open) return null;

    return (
        <div className={`modal ${open ? "show" : ""}`} onClick={blocking ? undefined : onClose}>
            <div className="backdrop" onClick={blocking ? undefined : onClose} />
            <div className="modal-content">
                <h2 className="modal-title">{title}</h2>
                <div className="modal-body" onClick={(e) => e.stopPropagation()}>
                    {children}
                    </div>
            </div>
        </div>
    )
}