import { addDays, daysInMonth } from "../utils/date";
import "./Navbar.css";

const base = import.meta.env.BASE_URL;

type Props = {
    day: Date;
    onChangeDay: (next: Date) => void;
    theme: "light" | "dark";
    toggleTheme: () => void;
    onOpenSettings: () => void;
};

export default function Navbar({
    day,
    onChangeDay,
    theme,
    toggleTheme,
    onOpenSettings,
}: Props) {
    const year = day.getFullYear();
    const month = day.getMonth() + 1;
    const date = day.getDate();
    const maxDays = daysInMonth(year, day.getMonth());

    return (
        <div className="nav-bar">
            <div className="nav-bar-1">
                <button
                    className="prev-btn"
                    type="button"
                    onClick={() => onChangeDay(addDays(day, -1))}
                >
                    前へ
                </button>

                <button className="today-btn" type="button" onClick={() => onChangeDay(new Date())}>
                    今日に戻る
                </button>

                <button
                    className="next-btn"
                    type="button"
                    onClick={() => onChangeDay(addDays(day, 1))}
                >
                    次へ
                </button>
            </div>

            <div className="nav-bar-2">
                <button className="theme-btn" type="button" onClick={toggleTheme}>
                    <img
                        src={theme === "dark" ? `${base}/images/moon-dark.svg` : `${base}/images/sun-light.svg`}
                        alt={theme === "dark" ? "ダークモード" : "ライトモード"}
                        style={{ width: "20px", height: "20px", display: "block", margin: "0 auto" }}
                    />
                </button>

                <div className="date-group">
                    <select
                        className="month-select"
                        value={month}
                        onChange={(e) => {
                            const nextMonth = Number(e.target.value);
                            const nextMonthIndex = nextMonth - 1;
                            const nextMax = daysInMonth(year, nextMonthIndex);
                            const nextDate = Math.min(date, nextMax);
                            onChangeDay(new Date(year, nextMonthIndex, nextDate));
                        }}
                    >
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}月
                            </option>
                        ))}
                    </select>

                    <select
                        className="day-select"
                        value={date}
                        onChange={(e) => {
                            onChangeDay(new Date(year, day.getMonth(), Number(e.target.value)));
                        }}
                    >
                        {[...Array(maxDays)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}日
                            </option>
                        ))}
                    </select>
                </div>

                <button className="setting" type="button" onClick={onOpenSettings}>
                    その他
                </button>
            </div>
        </div>
    );
}