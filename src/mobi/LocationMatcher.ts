import {Clipping} from "../clippings/Clipping";
import axios from "axios"

function firstValidUtf8ByteAfter(pos: number, buffer: ArrayBuffer) {
    const utf8intermediateByteMask = 0b11000000;
    const utf8intermediateByteMarker = 0b10000000;
    const view = new DataView(buffer);
    while ((view.getInt8(pos) & utf8intermediateByteMask) === utf8intermediateByteMarker)
        pos++;
    return pos;
}

const whitespace_betweenRtTag_htmlTag = /(<rt>.*<\/rt>)|(<[^<]*>)|([\s　]+)/g;
const utfEncoder = new TextEncoder();
const utfDecoder = new TextDecoder();


function foundByteStartIndex(foundIndex: number, htmlSearchExcerpt: string) {
    let excerptFoundStartIndex = 0;
    let startIndexAfterFoundIndex = 0;
    let match: RegExpExecArray;

    while (startIndexAfterFoundIndex <= foundIndex) {
        // Token is never null, because condition will be met after the last match in the worst case
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


export function findHighlightByteIndex(highlight: Clipping, bookBinary: ArrayBuffer, locations: number) {
    const SEARCH_RADIUS = 1000;
    const MAX_SEARCH_RADIUS = 3000;

    const locationSize = bookBinary.byteLength / locations;
    const locationStart = highlight.location!.start * locationSize;
    const sanitizedContent = highlight.content.replace(/[\s　]+/g, "");
    let currentRadius = 0;
    let foundIndex = -1;
    let htmlSearchExcerpt: string;
    let searchExcerptByteStart;
    do {
        currentRadius += SEARCH_RADIUS;
        searchExcerptByteStart = firstValidUtf8ByteAfter(locationStart - currentRadius, bookBinary);
        // max byte length of utf8 is 4
        const searchExcerptByteEnd = firstValidUtf8ByteAfter(locationStart + currentRadius - 4, bookBinary);
        const searchExcerptBinary = bookBinary.slice(searchExcerptByteStart, searchExcerptByteEnd);

        htmlSearchExcerpt = utfDecoder.decode(searchExcerptBinary);
        const searchExcerpt = htmlSearchExcerpt.replace(whitespace_betweenRtTag_htmlTag, "");

        foundIndex = searchExcerpt.search(sanitizedContent);
    } while (foundIndex === -1 && currentRadius !== MAX_SEARCH_RADIUS);

    if (foundIndex > -1) {
        return searchExcerptByteStart + foundByteStartIndex(foundIndex, htmlSearchExcerpt);
    }
    return -1;
}

export async function getBookContent1() {
    const axiosResponse = await axios.get<ArrayBuffer>('test.html', {
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