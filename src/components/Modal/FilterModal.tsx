import Modal from "../Modal";
import type { ModalType } from "../../types/type";
import { useEffect, useState } from "react";
import "./FilterModal.css";

type Props = ModalType & {
    filterSubject?: string;
    setFilterSubject: (v?: string) => void;
    options: string[];
};

export default function FilterModal({
    open,
    onClose,
    filterSubject,
    setFilterSubject,
    options,
}: Props) {
    const [localValue, setLocalValue] = useState<string>(() => filterSubject ?? options[0] ?? "");

    useEffect(() => {
        if (!open) return;
        if (filterSubject) {
            setLocalValue(filterSubject);
            return;
        }
        setLocalValue(options[0] ?? "");
    }, [open, filterSubject, options]);

    return (
        <Modal open={open} onClose={onClose} title="フィルターの設定" blocking={false}>
            <div className="filter-setup-modal">
                <div className="filter-row">
                    <label className="filter-label">教科</label>

                    <select
                        id="filter-select"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                    >
                        {options.map((subjects) => (
                            <option key={subjects} value={subjects}>{subjects}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-actions">
                    <button
                        type="button"
                        id="filter-clear"
                        onClick={() => {
                            setFilterSubject(undefined);
                            onClose();
                        }}
                    >
                        解除
                    </button>
                    <button
                        type="button"
                        id="filter-save"
                        disabled={!localValue}
                        onClick={() => {
                            setFilterSubject(localValue || undefined);
                            onClose();
                        }}
                    >
                        適用
                    </button>
                </div>
            </div>
        </Modal>
    );
}
