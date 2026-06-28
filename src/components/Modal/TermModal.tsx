import Modal from "../Modal"

type Props = {
    open: boolean;
    onClose: () => void;
    isTermAccepted: boolean;
    setIsTermAccepted: (v: boolean) => void;
};

export default function TermModal({
    open,
    onClose,
    isTermAccepted,
    setIsTermAccepted,
}: Props) {
    return (
        <Modal open={open} onClose={onClose} title="利用規約" blocking={true}>
            <div className="terms-modal">
                <h3>1. はじめに</h3>
                <p>本アプリの目的は、本アプリの利用者（以下、利用者）のそれぞれの選択科目や講座にあった時間割を提供し、時間割確認にかける負担を減らすことを図るものです。</p>
                <br></br>
                <h3>2. 禁止事項</h3>
                <p>利用者は次のことを行ってはいけません。</p>
                <ul>
                    <li>本アプリを開発者の了承なしに第三者に公開する行為</li>
                    <li>その他、開発者が不適切と判断した行為</li>
                </ul><br></br>
                <h3>3. 免責事項</h3>
                <ul>
                    <li>本アプリの利用によって生じた損害について、開発者は一切の責任を負いません。</li>
                    <li>本アプリの情報は、正確性を保証するものではありません。</li>
                    <li>予告なく機能の変更・停止を行う場合があります。</li>
                </ul><br></br>
                <h3>4. データの扱い</h3>
                <ul>
                    <li>「メモ」に保存されたデータは、利用者の端末内(LocalStorage)に保存されます。外部に送信されることは一切ありません。</li>
                    <li>Google Analytics 4 を利用して、利用者の動向の確認のために、訪問データを収集する場合があります。</li>
                    <li>「メモ」に保存されたデータはキャッシュの削除やその他の操作によって削除される可能性があります。重要なデータは「メモ」だけに保存しないでください。</li>
                </ul><br></br>
                <h3>5. 規約の変更</h3>
                <p>開発者は、必要に応じて本規約を変更することができます。変更後の規約は、本アプリに掲載した時点から効力を持ちます。</p>
                <br></br><br></br>
                <p style={{textAlign: "right"}}>2026年4月4日</p>

                <div style={{ marginTop: "20px" }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isTermAccepted}
                            onChange={(e) => setIsTermAccepted(e.target.checked)}
                        />
                        利用規約に同意
                    </label>
                </div>

                <button
                    className="close-modal"
                    onClick={onClose}
                    disabled={!isTermAccepted}
                    style={{
                        marginTop: "20px",
                        opacity: isTermAccepted ? 1 : 0.5,
                        cursor: isTermAccepted ? "pointer" : "not-allowed",
                    }}
                >
                    閉じる
                </button>
            </div>
        </Modal>
    );
}
