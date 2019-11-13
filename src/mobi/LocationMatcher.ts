import {Book, Clipping} from "../clippings/Clipping";
import axios from "axios"
import _ from "lodash"

function firstValidUtf8ByteAfter(pos: number, buffer: ArrayBuffer) {
    const utf8intermediateByteMask = 0b11000000;
    const utf8intermediateByteMarker = 0b10000000;
    const view = new DataView(buffer);
    while ((view.getInt8(pos) & utf8intermediateByteMask) === utf8intermediateByteMarker)
        pos++;
    return pos;
}

const whitespace_betweenRtTag_htmlTag = /(<rt>.*?<\/rt>)|(<[^<]*>)|([\s　]+)/g;
const betweenRtTag_htmlTag = /(<rt>.*?<\/rt>)|(<[^<]*>)/g;
const utfEncoder = new TextEncoder();
const utfDecoder = new TextDecoder();

function foundByteStartIndex(foundIndex: number, htmlSearchExcerpt: string) {
    let excerptFoundStartIndex = 0;
    let startIndexAfterFoundIndex = 0;
    let match: RegExpExecArray;
    htmlSearchExcerpt += " <guard/>";
    whitespace_betweenRtTag_htmlTag.lastIndex = 0;
    while (startIndexAfterFoundIndex <= foundIndex) {
        match = whitespace_betweenRtTag_htmlTag.exec(htmlSearchExcerpt)!;
        startIndexAfterFoundIndex += match.index! - excerptFoundStartIndex;
        excerptFoundStartIndex = whitespace_betweenRtTag_htmlTag.lastIndex
    }
    // Remove length of the last html match (or whitespaces)
    excerptFoundStartIndex -= match![0].length;
    //  startIndexAfterFoundIndex is equal or greater than actualFoundIndex
    //  so we need to subtract that length |>(  )foundIndex.(thatLength).startIndexAfterFoundIndex<  |
    // to get global excerpt found start index
    excerptFoundStartIndex -= (startIndexAfterFoundIndex - foundIndex);
    return utfEncoder.encode(htmlSearchExcerpt.slice(0, excerptFoundStartIndex)).length;
}

interface HighlightBytePosition {
    index:number;
    length:number;
}
var delta = 0;

// Books discrepancies tend to grow as we're processing highlights in later positions, and delta helps minimizing that difference
function updateLocationDelta(excerptStartByte:number,foundStartByte:number, locationStartByte: number){
    delta += excerptStartByte + foundStartByte - locationStartByte;
}
function findHighlightByteIndex(highlight: Clipping, bookBinary: ArrayBuffer, locations: number) : HighlightBytePosition | null {
    const SEARCH_RADIUS = 1000;
    const MAX_SEARCH_RADIUS = 10000;

    const locationSize = ~~(bookBinary.byteLength / locations);
    const locationStart = highlight.location!.start * locationSize + delta;
    const sanitizedContent = highlight.content.replace(/[\s　]+/g, "");
    let currentRadius = 0;
    let foundIndex = -1;
    let htmlSearchExcerpt: string;
    let searchExcerptByteStart;
    do {
        currentRadius += SEARCH_RADIUS;
        searchExcerptByteStart = firstValidUtf8ByteAfter(
            _.max([locationStart - currentRadius,0])!, bookBinary);
        // max byte length of utf8 is 4
        const searchExcerptByteEnd = firstValidUtf8ByteAfter(
            _.min([locationStart + currentRadius,bookBinary.byteLength])! - 4, bookBinary);

        const searchExcerptBinary = bookBinary.slice(searchExcerptByteStart, searchExcerptByteEnd);

        htmlSearchExcerpt = utfDecoder.decode(searchExcerptBinary);
        const searchExcerpt = htmlSearchExcerpt.replace(whitespace_betweenRtTag_htmlTag, "");

        foundIndex = searchExcerpt.indexOf(sanitizedContent);
    } while (foundIndex === -1 && currentRadius !== MAX_SEARCH_RADIUS);
    if (foundIndex > -1) {
        const index = foundByteStartIndex(foundIndex, htmlSearchExcerpt);
        console.log(`start: ${locationStart} found: ${searchExcerptByteStart +  index} delta: ${searchExcerptByteStart +  index - locationStart} radius: ${currentRadius}\n${highlight.content}`);
        updateLocationDelta(searchExcerptByteStart,index,locationStart);
        return {
            index : searchExcerptByteStart + index,
            length : foundByteStartIndex(foundIndex+sanitizedContent.length, htmlSearchExcerpt) - index
        }
    }
    return null;
}

function isFullStop(fullStops: Uint8Array[], view: DataView, current: number): number {
    const result = fullStops.find(dot =>
        dot.every((byte, index) =>
            view.getUint8(current + index) === byte)
    );
    return result ? result.length : 0;
}


function surroundingSentences(highlight: Clipping, highlightPosition: HighlightBytePosition, bookBinary: ArrayBuffer, sentences = 1): SurroundingContent {
    // TODO this doesn't take into account dots that can be inside html tags, exclude them.
    const view = new DataView(bookBinary);

    const fullStops = [".", "。", "｡"].map(dot => utfEncoder.encode(dot));

    let startDot = highlightPosition.index;
    let sentencesFound = 0;
    while (sentencesFound < sentences && startDot > 0) {
        startDot--;
        if (isFullStop(fullStops, view, startDot))
            sentencesFound++;
    }
    startDot += isFullStop(fullStops, view, startDot);
    // -4 (max utf length) accounts for a case when the last character is some kind of full stop
    let endDot = highlightPosition.index+highlightPosition.length - 4;
    sentencesFound = 0;
    while (sentencesFound < sentences && endDot < bookBinary.byteLength) {
        endDot++;
        if (isFullStop(fullStops, view, endDot))
            sentencesFound++;
    }

    return {
        before: utfDecoder.decode(bookBinary.slice(startDot, highlightPosition.index))
            .replace(betweenRtTag_htmlTag, "").trim(),
        after: utfDecoder.decode(bookBinary.slice(highlightPosition.index+highlightPosition.length, endDot))
            .replace(betweenRtTag_htmlTag, "").trim()
    }
}

export function setHighlightsSurroundings(highlights: Clipping[], book: Book, sentences: number = 1) {
    if (!book.locations || !book.bytes)
        throw Error("book must have locations and bytes");
    _.sortBy(highlights,["location.start"]).forEach(highlight => {
        const bytePosition = findHighlightByteIndex(highlight, book.bytes!, book.locations!);
        if (bytePosition != null)
            highlight.surrounding = surroundingSentences(highlight, bytePosition, book.bytes!, sentences);
    })
}


export interface SurroundingContent {
    before: string;
    after: string;
}



export async function getBookContent1() {
    const axiosResponse = await axios.get<ArrayBuffer>('wok.html', {
        responseType: "arraybuffer"
    });
    return axiosResponse.data;
}

async function getBookContent(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const axiosResponse = await axios.post<string>('bookcontent', formData, {
        responseType: "arraybuffer"
    });
    return axiosResponse.data;
}
