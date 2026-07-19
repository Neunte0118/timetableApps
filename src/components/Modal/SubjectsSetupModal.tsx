import Modal from "../Modal";
import type { ModalType, ExpansionMap } from "../../types/type";
import "./SubjectsSetupModal.css";

type Props = ModalType & {
    expansionMap: ExpansionMap;
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

    const isLoadingExpansionMap = expansionKeys.length === 0;
    const isWaitingTimetable = !isLoadingExpansionMap && (expansionClassMap?.length ?? 0) === 0;

    // このクラスの時間割から実際に登場した選択科目（origin）だけを対象にする。
    // ロード中（isWaitingTimetable）は、まだクラス固有の科目が判明していないため
    // 全選択科目にフォールバックせず、空のまま「読み込み中」表示に委ねる。
    const targets = isWaitingTimetable
        ? []
        : (expansionClassMap ?? []).filter((v) => keySet.has(v));

    const isReady = !isLoadingExpansionMap && !isWaitingTimetable;

    return (
        <Modal open={open} onClose={onClose} title="選択科目の設定" blocking={true}>
            <div className="subject-setup">
                {isLoadingExpansionMap && (
                    <p className="muted">選択科目データを読み込み中…</p>
                )}

                {isWaitingTimetable && (
                    <p className="muted">時間割データを読み込み中…</p>
                )}

                {isReady && targets.length === 0 && (
                    <p className="muted">選択科目が見つかりませんでした。</p>
                )}

                {isReady &&
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
