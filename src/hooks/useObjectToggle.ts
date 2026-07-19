import { useState } from "react";

export function useObjectToggle<T extends Record<string, unknown>>(initial: T) {
    const [state, setState] = useState<T>(initial);

    const toggleKey = (key: keyof T) => {
        setState((prev) => {
            const value = prev[key];

            if (typeof value === "boolean") {
                return {
                    ...prev,
                    [key]: !value,
                };
            }

            return prev;
        });
    };

    return { state, toggleKey, setState };
}
