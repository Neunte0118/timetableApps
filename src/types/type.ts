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