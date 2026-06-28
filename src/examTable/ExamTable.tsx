import { useParams } from "react-router-dom";
import { loadExamTable } from "@/services/useExamData";
import { useEffect } from "react";

type Props ={
  theme: "light" | "dark";
  isTermAccepted: boolean;
  classNumber: number | null;
  subjectChoices: Record<string, string> | null;
}

const EXAM_DATA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQy3XEeDOJ5hTIHZN8dhXqzpiWdsqpYWnZPhO4fGPe28VarMzeU8ikVIPFGJBn_m5REbH7eE83yM77O/pub?gid=139648733&single=true&output=csv";

export default function ExamTable({theme, isTermAccepted, classNumber, subjectChoices,}: Props) {
  const { examTableId } = useParams<string>();
  
  useEffect(() => {
    const load = async () => {
      const data = await loadExamTable(EXAM_DATA);
      const examData = data[examTableId ?? ""];
      return examData;
    };

    const examData = load();
  }, [examTableId]);
  
  return (
    <div>

    </div>
  )
}