import { useState } from "react";

import { Routes, Route } from "react-router-dom";

import { getStorage } from "./utils/storage";

import { useTheme } from "./hooks/useTheme";

import HomePage from "./HomePage";
import ExamTable from "./examTable/ExamTable";

export default function App() {
    const { theme, toggleTheme } = useTheme();
    const [isTermAccepted, setIsTermAccepted] = useState<boolean>(getStorage("isTermAccepted") ?? false);
    const [classNumber, setClassNumber] = useState<number | null>(getStorage("classNumber") ?? null);
    const [subjectChoices, setSubjectChoices] = useState<Record<string, string> | null>(getStorage("subjectChoices"));

    return (
        <Routes>
            <Route
                path="/tools/timetableApps/"
                element={
                    <HomePage
                        theme={theme}
                        toggleTheme={toggleTheme}
                        isTermAccepted={isTermAccepted}
                        setIsTermAccepted={setIsTermAccepted}
                        classNumber={classNumber}
                        setClassNumber={setClassNumber}
                        subjectChoices={subjectChoices}
                        setSubjectChoices={setSubjectChoices}
                    />
                }
            />

            <Route
                path="/tools/timetableApps/exam/:examTableId"
                element={
                    <ExamTable
                        theme={theme}
                        isTermAccepted={isTermAccepted}
                        classNumber={classNumber}
                        subjectChoices={subjectChoices}
                    />
                }
            />
        </Routes>
    );
}
