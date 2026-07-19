export type tableModeType =
    | "subjects"
    | "rooms"
    | "teachers";

export type ModalType = {
    open: boolean;
    onClose: () => void;
};

export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONObject
    | JSONArray;

export interface JSONObject {
    [key: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}

export type NestedRecord = JSONObject;

export type Weekday = "月" | "火" | "水" | "木" | "金" | "土";

export type WeekPattern = Partial<Record<Weekday, string[]>>;

export type ClassTimetableData = Record<string, WeekPattern>;

/**
 * 時間割の上書き（CSVフィード由来）を表す行。
 * classes === "0" は全クラス共通の上書きを意味する。
 */
export type TimetableOverrideRow = {
    dates: string;
    classes: string;
    periods: string;
    subjects: string;
};

/**
 * 更新履歴CSVの1行。
 */
export type UpdateInfoRow = {
    versions: string;
    dates: string;
    contents: string;
};

/**
 * 選択科目・教室名対応表から生成されるデータ。
 */
export type ExpansionMap = Record<string, string[]>; // origin -> electives[]
export type SubjectsRoomsMap = Record<string, string>; // electives -> 表示名 (教室名等)

export type SubjectsData = {
    expansionMap: ExpansionMap | null;
    subjectsRoomsMap: SubjectsRoomsMap | null;
};

/**
 * teacher.json の型。
 * - HR担任などクラス番号配列で持つもの
 * - 通常教科は byClass[subjectName][classNumber] 形式
 * - 選択科目は electives[subjectName] 形式
 * 実データの形が確定していないため緩めの型に留める。
 */
export type TeacherMap = Record<string, string | string[] | undefined>;
