import {SurroundingContent} from "./HighlightLocationMatcher";

export enum Type {
    note,
    highlight,
    bookmark
}

export interface Position {
    start: number,
    end: number
}

export interface Metadata {
    date: Date,
    location?: Position;
    page?: Position;
    type: Type
}

export interface Clipping extends Metadata {
    title: string,
    author?: string,
    content: string,
    notes?: Clipping[],
    surrounding?: SurroundingContent[]
}

export interface Highlight extends Clipping{
    notes?: Clipping[],
    surrounding?: SurroundingContent[]
}


export interface Book {
    title: string,
    locations?: number,
    bytes?: ArrayBuffer
}