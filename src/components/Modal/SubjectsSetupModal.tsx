import Modal from "../Modal";
import type { ModalType } from "../../types/type";
import "./SubjectsSetupModal.css"

type Props = ModalType & {
    expansionMap: Record<string, string[]>; // ← 選択肢の配列に修正
    expansionClassMap: string[];
    subjectChoices: Record<string, string>;
    setSubjectChoices: (v: Record<string, string>) => void;
};

export default function SubjectsSetupModal({
    open,
    onClose,
    expansionMap,
    expansionClassMap,
    subjectChoices,
    setSubjectChoices,
}: Props) {

    const handleChange = (key: string, value: string) => {
        setSubjectChoices({
            ...subjectChoices,
            [key]: value,
        });
    };

    const expansionKeys = Object.keys(expansionMap ?? {});
    const keySet = new Set(expansionKeys);
    const intersection = (expansionClassMap ?? []).filter((v) => keySet.has(v));
    const targets = intersection.length > 0 ? intersection : expansionKeys;

    const isLoadingExpansionMap = expansionKeys.length === 0;
    const isWaitingTimetable = !isLoadingExpansionMap && (expansionClassMap?.length ?? 0) === 0;

    return (
        <Modal open={open} onClose={onClose} title="選択科目の設定" blocking={true}>
            <div className="subject-setup">
                {isLoadingExpansionMap && (
                    <p className="muted">選択科目データを読み込み中…</p>
                )}

                {isWaitingTimetable && (
                    <p className="muted">時間割データを読み込み中…</p>
                )}

                {!isLoadingExpansionMap && targets.length === 0 && (
                    <p className="muted">選択科目が見つかりませんでした。</p>
                )}

                {!isLoadingExpansionMap &&
                    targets.map((v) => (
                        <label className="subject-row" key={v}>
                            <span className="subject-code">{v}</span>

                            <select
                                value={subjectChoices[v] ?? ""}
                                onChange={(e) => handleChange(v, e.target.value)}
                            >
                                <option value="">未選択</option>

                                {expansionMap[v]?.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ))}

                <div className="subject-actions">
                    <button className="close-modal" onClick={onClose}>
                        閉じる
                    </button>
                </div>
            </div>
        </Modal>
    );
}
