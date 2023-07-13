import { Datafile } from "./datafile";

export interface DatafileDataChunks {
    ref: Datafile["_id"],
    id: String,
    data: Object,
}