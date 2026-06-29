import { useParams } from "react-router-dom";
import { loadExamTable } from "@/hooks/useExamData";
import type { ExamDataType } from "@/hooks/useExamData";
import { useEffect, useState } from "react";

type Props ={
  theme: "light" | "dark";
  isTermAccepted: boolean;
  classNumber: number | null;
  subjectChoices: Record<string, string> | null;
}

const EXAM_DATA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQy3XEeDOJ5hTIHZN8dhXqzpiWdsqpYWnZPhO4fGPe28VarMzeU8ikVIPFGJBn_m5REbH7eE83yM77O/pub?gid=139648733&single=true&output=csv";

export default function ExamTable({theme, isTermAccepted, classNumber, subjectChoices,}: Props) {
  const { examTableId } = useParams<string>();
  const [examData, setExamData] = useState<ExamDataType>();
  const [examName, setExamName] = useState<string>();
  const [selectedDate, setSelectedDate] = useState<string[]>();
  
  const subjectsChoicesMap: Record<string, string> = {
    "古探": "古典探究",
    "古講": "古典講読",
    "現世読": "現代世界を読む",

    "英語Wt": "英語W",
    "数演L": "数学ⅡL",
    "数ⅡLa": "数学ⅡL",
    "数ⅡLb": "数学ⅡL",
    "数ⅡS": "数学ⅡS",
    "数講Sa": "数学講究S",
    "数講Sb": "数学講究S",

    "世講": "世界史講究",
    "世特": "世界史特講",
    "地理講": "地理講究",
    "地理特": "地理特講",
    "日講": "日本史講究",
    "日特": "日本史特講",
    "倫政講": "倫政講究",
    "倫政特": "倫政特講",


    "化S": "化学S",
    "物S": "物理S",
    "生S": "生物S",
    "化L": "化学L",
    "物L": "物理L",
    "生L": "生物L",
    "地L": "地学L",
  };

  const subjectChoicesSet = new Set(
    Object.values(subjectChoices ?? {})
      .map((v) => v.replace(/[①②③④⑤⑥⑦⑧⑨⑩]+$/, ""))  
      .map((v) => subjectsChoicesMap[v] ?? v)
  );
  
  console.log(subjectChoicesSet)

  useEffect(() => {
    const load = async () => {
      const data: any = await loadExamTable(EXAM_DATA);
      const result = data[examTableId ?? ""];
      setExamData(result);
      setExamName(result.examName);
    };

    load();
  }, [examTableId]);
  
  const datesList = Object.keys(examData?.dates ?? {}).sort();
  
  const subjectsList: Record<string, string[]> = Object.fromEntries(
    Object.entries(examData?.dates ?? {}).map(([date, items]) => {
      const list = Array.isArray(items) ? items : [];

      return [
        date,
        list
          .map((item) => item.subjects)
          .filter((subject) => subjectChoicesSet.has(subject)),
      ];
    })
  );

  console.log(subjectsList)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(examData));
  };

  const viewSubjects = (v: string) => {
    setSelectedDate(subjectsList[v]);
  }

  if (!isTermAccepted) return;

  return (
    <div>
      <div className="info">
        <div 
          className="examName"
          style={{ textAlign: "center", fontSize: "1.45rem"}}
        >
          {examName}
        </div>        
      </div>

      <div className="DatesButton">
        {datesList.map((v) => (
          <button
            value={v}
            onClick={() => viewSubjects(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="subjectsField">
        {selectedDate?.map((v) => (
          <button
            value={v}

          >
            {v}
          </button>
        ))}
      </div>

      <button onClick={handleCopy}>copy</button>
    </div>
  )
}