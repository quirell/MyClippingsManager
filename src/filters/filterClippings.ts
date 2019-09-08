import {Clipping, Type} from "../clippings/Clipping";
import {isAfter, isBefore} from "date-fns";

export interface Filters {
    note: boolean
    bookmark: boolean
    highlight: boolean
    joinedNoteHighlight: boolean
    dateFrom: Date | null
    dateTo: Date | null
    content: string
    location: number | ""
    page: number | ""
    author: string[]
    book: string[]
}

class Filter{
    constructor(public active:(filters:Filters) => boolean,public execute:(clippping:Clipping,filters:Filters) => boolean){}
}

const filterList = [
    new Filter(f => !(f.note && f.highlight && f.bookmark),(c,f) =>
        f.highlight && c.type === Type.highlight ||
        f.note && c.type === Type.note ||
        f.bookmark && c.type === Type.bookmark),
    new Filter(f => f.joinedNoteHighlight,c => c.notes !== undefined && c.notes.length > 0),
    new Filter(f => f.dateFrom != null,(c,f) => isAfter(c.date,f.dateFrom!)),
    new Filter(f => f.dateTo != null,(c,f) => isBefore(c.date,f.dateTo!)),
    new Filter(f => f.page !== "",(c,f) =>
        c.page !== undefined && c.page.start <= f.page && f.page <= c.page.end),
    new Filter(f => f.location !== "",(c,f) =>
        c.location !== undefined && c.location.start <= f.location && f.location <= c.location.end),
    new Filter(f => f.author.length > 0,(c,f) => f.author.includes(c.author!)),
    new Filter(f => f.book.length > 0,(c,f) => f.book.includes(c.title)),
    new Filter(f => f.content !== "",(c,f) => c.content.includes(f.content))
];

export const defaultFilters:Filters = {
    dateTo: null,
    dateFrom: null,
    author: [],
    book: [],
    content: "",
    highlight: true,
    note: true,
    bookmark: true,
    joinedNoteHighlight: false,
    page: "",
    location: ""
};

export function filterClippings(clippings: Clipping[], filters: Filters): Clipping[] {
    console.time("filter");
    const activeFilters = filterList.filter(f => f.active(filters));
    const filtered = activeFilters.reduce((filtered, {execute}) => filtered.filter(c => execute(c,filters)),clippings);
    console.timeEnd("filter");
    return filtered;
}
