export type tableModeType = 
    | "subjects" 
    | "rooms"
    | "teachers"

export type ModalType = {
    open: boolean;
    onClose: () => void;
}

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

export type WeekPattern = Record<Weekday, string[]>;

export type ClassTimetableData = {
    A?: WeekPattern;
    B?: WeekPattern;
    C?: WeekPattern;
};