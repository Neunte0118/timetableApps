import { getStorage, setStorage } from "../utils/storage";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
    const preferTheme: Theme =
        window.matchMedia("(prefers-color-scheme: light)").matches
            ? "light"
            : "dark";

    const [theme, setTheme] = useState<Theme>(() => {
        return (getStorage("theme") as Theme) || preferTheme;
    });

    const toggleTheme = () => {
        const next: Theme = theme === "light" ? "dark" : "light";
        setTheme(next);
        setStorage("theme", next);
    };

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("theme-light", "theme-dark");
        root.classList.add(`theme-${theme}`);
    }, [theme]);

    return { theme, toggleTheme };
}
