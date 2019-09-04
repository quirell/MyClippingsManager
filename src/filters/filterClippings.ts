import {Clipping} from "../clippings/Clipping";

export interface Filters {
    note?: boolean
    bookmark?: boolean
    highlight?: boolean
    joinedNoteHighlight?: boolean
    dateFrom: Date | null
    dateTo: Date | null
    content?: string
    location?: number
    page?: number
    author?: string[]
    book?: string[]
}

export function filterClippings(clippings: Clipping[], filter: Filters): Clipping[] {
    return clippings;
}
