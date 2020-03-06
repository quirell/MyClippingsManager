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
    // Content after user modifies it
    modifiedContent?: string,
    noteIds?: string[],
    notes?: string[],
    surrounding?: SurroundingContent[],
    addedOn: Date,
    id: string,
    deleted?: 0 | 1
}

export interface Book {
    title: string,
    locations?: number,
    bytes?: ArrayBuffer
}