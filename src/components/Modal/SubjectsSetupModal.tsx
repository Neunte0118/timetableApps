import Modal from "../Modal";
import type { ModalType, ExpansionMap } from "../../types/type";
import { SATURDAY_LECTURES, SATURDAY_LECTURE_KEYS } from "../../utils/saturdayLectures";
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
        const next = {
            ...subjectChoices,
            [key]: value,
        };
        // 土曜講習の場合はエイリアスキー（例: "土曜講習1"）も同期保存
        const lecture = SATURDAY_LECTURES.find(
            (l) => l.key === key || l.aliases.includes(key)
        );
        if (lecture) {
            lecture.aliases.forEach((alias) => {
                next[alias] = value;
            });
        }
        setSubjectChoices(next);
    };

    const expansionKeys = Object.keys(expansionMap ?? {});
    const keySet = new Set(expansionKeys);

    const isLoadingExpansionMap = expansionKeys.length === 0;
    const isWaitingTimetable = !isLoadingExpansionMap && (expansionClassMap?.length ?? 0) === 0;

    // このクラスの時間割から実際に登場した通常の選択科目（土曜講習以外）
    const regularTargets = isWaitingTimetable
        ? []
        : (expansionClassMap ?? [])
              .filter((v) => keySet.has(v) && !SATURDAY_LECTURE_KEYS.has(v))
              .sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));

    return (
        <Modal open={open} onClose={onClose} title="選択科目の設定" blocking={true}>
            <div className="subject-setup">
                {isLoadingExpansionMap && (
                    <p className="muted">選択科目データを読み込み中…</p>
                )}

                {isWaitingTimetable && (
                    <p className="muted">時間割データを読み込み中…</p>
                )}

                {/* 土曜講習（①〜④） */}
                {SATURDAY_LECTURES.map((lecture) => (
                    <label className="subject-row" key={lecture.key}>
                        <span className="subject-code">{lecture.key}</span>

                        <select
                            value={subjectChoices[lecture.key] ?? ""}
                            onChange={(e) => handleChange(lecture.key, e.target.value)}
                        >
                            <option value="">未選択</option>

                            {lecture.options.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </label>
                ))}

                {/* 通常の選択科目（A1, B1など、クラス時間割に存在する場合） */}
                {regularTargets.map((v) => {
                    const options = [...(expansionMap[v] ?? [])].sort((a, b) =>
                        a.localeCompare(b, "ja", { numeric: true })
                    );
                    return (
                        <label className="subject-row" key={v}>
                            <span className="subject-code">{v}</span>

                            <select
                                value={subjectChoices[v] ?? ""}
                                onChange={(e) => handleChange(v, e.target.value)}
                            >
                                <option value="">未選択</option>

                                {options.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </label>
                    );
                })}

                <div className="subject-actions">
                    <button className="close-modal" onClick={onClose}>
                        閉じる
                    </button>
                </div>
            </div>
        </Modal>
    );
}
