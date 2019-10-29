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

const utfEncoder = new TextEncoder();
const utfDecoder = new TextDecoder();

export function findHighlightByteIndex(highlight: Clipping, bookBinary: ArrayBuffer, locations: number) {
    const whitespace_betweenRtTag_htmlTag = /(<rt>.*<\/rt>)|(<[^<]*>)|([\s　]+)/g;
    const SEARCH_RADIUS = 1000;
    const MAX_SEARCH_RADIUS = 3000;

    let currentRadius = 0;
    let foundIndex = -1;
    const locationSize = bookBinary.byteLength / locations;
    const locationStart = highlight.location!.start * locationSize;
    const sanitizedContent = highlight.content.replace(/[\s　]+/g, "");
    let htmlSearchExcerpt: string;
    let searchExcerptBinary: ArrayBuffer;
    do {
        currentRadius += SEARCH_RADIUS;
        searchExcerptBinary = bookBinary.slice(locationStart - currentRadius, locationStart + currentRadius);
        const validSearchExcerptBinary = searchExcerptBinary.slice(
            firstValidUtf8ByteAfter(0, searchExcerptBinary),
            // max length of utf8 is 4, therefore 5 is a safe value
            firstValidUtf8ByteAfter(searchExcerptBinary.byteLength - 5, searchExcerptBinary));

        htmlSearchExcerpt = utfDecoder.decode(validSearchExcerptBinary);
        const searchExcerpt = htmlSearchExcerpt.replace(whitespace_betweenRtTag_htmlTag, "");

        foundIndex = searchExcerpt.search(sanitizedContent);
    } while (foundIndex === -1 && currentRadius !== MAX_SEARCH_RADIUS);

    if (foundIndex > -1) {
        let excerptFoundStartIndex = 0;
        let localFoundStartIndex = 0;
        let token: RegExpExecArray;
        while (localFoundStartIndex <= foundIndex) {
            // Token is never null, because condition will be met after the last match in the worst case
            token = whitespace_betweenRtTag_htmlTag.exec(htmlSearchExcerpt)!;
            localFoundStartIndex += token.index! - excerptFoundStartIndex;
            excerptFoundStartIndex = whitespace_betweenRtTag_htmlTag.lastIndex
        }
        // Remove length of the last token
        excerptFoundStartIndex -= token![0].length;
        //  localFoundStartIndex is equal or greater than actualFoundIndex
        //  so we need to subtract that length |>(  )foundIndex.(thatLength).localFoundStartIndex<  |
        // to get global excerpt found start index
        excerptFoundStartIndex -= localFoundStartIndex - foundIndex;
        const globalExcerptByteStartIndex = locationStart - currentRadius + firstValidUtf8ByteAfter(0, searchExcerptBinary);
        const excerptFoundByteStartIndex = utfEncoder.encode(htmlSearchExcerpt.slice(0, excerptFoundStartIndex)).length;
        const globalFoundByteStartIndex = globalExcerptByteStartIndex + excerptFoundByteStartIndex;
        return globalFoundByteStartIndex;
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