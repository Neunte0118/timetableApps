import Modal from "../Modal";
import type { ModalType } from "../../types/type";
import "./ClassSetupModal.css";

type Props = ModalType & {
    classNumber: number | null;
    setClassNumber: (v: number) => void;
}

export default function ClassSetupModal({open, onClose, classNumber, setClassNumber}: Props) {
    return (
        <Modal open={open} onClose={onClose} title="クラスの設定" blocking={true}>
            <div className="class-setup-modal">
                <div className="class-row">
                    <label>クラス</label>
                    <select 
                        id="class-select" 
                        value={classNumber ?? ""}
                        onChange={(e) => setClassNumber(Number(e.target.value))}
                    >   
                        <option value="" disabled hidden>未選択</option>
                        {[...Array(9).keys()].map((n) => (
                            
                            <option key={n+1} value={n+1}>
                                {n+1}組
                            </option>
                        ))}
                    </select>
                </div>
                <p id="class-error" className="class-error" style={{display: "none"}}></p>
                <button className="close-modal" onClick={onClose}>閉じる</button>
            </div>
        </Modal>
    );
}