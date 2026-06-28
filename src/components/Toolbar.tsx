import Modal from "./Modal";
import "./Toolbar.css";
import { tableModeType } from "../types/type";

type Props = {
    tableMode: tableModeType;
    toggleTableMode: () => void;
    setIsFilterOpen: () => void;
}

export default function Toolbar({tableMode, toggleTableMode, setIsFilterOpen}: Props) {
    const dayMap = ["日", "月", "火", "水", "木", "金", "土"]
    const d = new Date();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = dayMap[d.getDay()];
    const hour = String(d.getHours()).padStart(2, "0"); 
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const now =  `${month}/${date}(${day}) ${hour}:${minutes}`;
    const tableModeMap = {
        subjects : "時間割",
        rooms : "移動教室",
        teachers : "先生",
    };

    const key: tableModeType = tableMode;

    return (
        <div className="toolbar">
            <style>{`
                button {
                    height: 32px;
                    width: 64px;
                }
                `}
            </style>


            <button className="toggle-moving-mode" onClick={toggleTableMode}>
                {tableModeMap[key]}
            </button>

            <div className="now">{now}</div>

            <button className="filter" onClick={setIsFilterOpen}>フィルタ</button>
        </div>
    )
}