import {Book, Clipping} from "../clippings/Clipping";
import axios from "axios"
import _ from "lodash"


export class HighlightLocationMatcher {

    private readonly whitespace_betweenRtTag_htmlTag = /(<rt>.*?<\/rt>)|(<[^<]*>)|([\s　]+)/g;
    private readonly betweenRtTag_htmlTag = /(<rt>.*?<\/rt>)|(<[^<]*>)/g;
    private readonly utfEncoder = new TextEncoder();
    private readonly utfDecoder = new TextDecoder();
    private readonly FULL_STOPS = [".", "。", "｡"].map(dot => this.utfEncoder.encode(dot));

    private readonly SEARCH_RADIUS = 1000;
    private readonly MAX_SEARCH_RADIUS = 10000;
    // Found locations tend to grow farther from the location center as we're processing highlights and delta helps minimizing that difference
    private delta = 0;

    private readonly book: Required<Book>;
    private readonly bookDataView: DataView;
    private readonly locationSize: number;

    constructor(book: Book) {
        if (!book.locations || !book.bytes)
            throw Error("book must have locations and bytes");
        this.book = book as Required<Book>;
        this.bookDataView = new DataView(this.book.bytes);
        this.locationSize = ~~(this.book.bytes.byteLength / this.book.locations);
    }

    private firstValidUtf8ByteAfter(pos: number, buffer: ArrayBuffer) {
        const utf8intermediateByteMask = 0b11000000;
        const utf8intermediateByteMarker = 0b10000000;
        const view = new DataView(buffer);
        while ((view.getInt8(pos) & utf8intermediateByteMask) === utf8intermediateByteMarker)
            pos++;
        return pos;
    }

    private foundByteStartIndex(foundIndex: number, htmlSearchExcerpt: string) {
        let excerptFoundStartIndex = 0;
        let startIndexAfterFoundIndex = 0;
        let match: RegExpExecArray;

        this.whitespace_betweenRtTag_htmlTag.lastIndex = 0;
        htmlSearchExcerpt += " <guard/>";

        while (startIndexAfterFoundIndex <= foundIndex) {
            match = this.whitespace_betweenRtTag_htmlTag.exec(htmlSearchExcerpt)!;
            startIndexAfterFoundIndex += match.index! - excerptFoundStartIndex;
            excerptFoundStartIndex = this.whitespace_betweenRtTag_htmlTag.lastIndex
        }
        // Remove length of the last html match (or whitespaces)
        excerptFoundStartIndex -= match![0].length;
        //  startIndexAfterFoundIndex is equal or greater than actualFoundIndex
        //  so we need to subtract that length |>(  )foundIndex.(thatLength).startIndexAfterFoundIndex<  |
        // to get global excerpt found start index
        excerptFoundStartIndex -= (startIndexAfterFoundIndex - foundIndex);
        return this.utfEncoder.encode(htmlSearchExcerpt.slice(0, excerptFoundStartIndex)).length;
    }

    private updateLocationDelta(excerptStartByte: number, foundStartByte: number, locationStartByte: number) {
        this.delta += excerptStartByte + foundStartByte - locationStartByte;
    }

    private findHighlightByteIndex(highlight: Clipping): HighlightBytePosition | null {
        const sanitizedContent = highlight.content.replace(/[\s　]+/g, "");
        let htmlSearchExcerpt: string;

        const locationStart = highlight.location!.start * this.locationSize + this.delta;
        let currentRadius = 0;
        let foundIndex = -1;
        let searchExcerptByteStart;
        do {
            currentRadius += this.SEARCH_RADIUS;

            searchExcerptByteStart = this.firstValidUtf8ByteAfter(
                _.max([locationStart - currentRadius, 0])!, this.book.bytes);
            // max byte length of utf8 is 4
            const searchExcerptByteEnd = this.firstValidUtf8ByteAfter(
                _.min([locationStart + currentRadius, this.book.bytes.byteLength])! - 4, this.book.bytes);

            const searchExcerptBinary = this.book.bytes.slice(searchExcerptByteStart, searchExcerptByteEnd);

            htmlSearchExcerpt = this.utfDecoder.decode(searchExcerptBinary);
            const searchExcerpt = htmlSearchExcerpt.replace(this.whitespace_betweenRtTag_htmlTag, "");

            foundIndex = searchExcerpt.indexOf(sanitizedContent);
        } while (foundIndex === -1 && currentRadius !== this.MAX_SEARCH_RADIUS);

        if (foundIndex > -1) {
            const index = this.foundByteStartIndex(foundIndex, htmlSearchExcerpt);
            console.log(`start: ${locationStart} found: ${searchExcerptByteStart + index} delta: ${searchExcerptByteStart + index - locationStart} radius: ${currentRadius}\n${highlight.content}`);
            this.updateLocationDelta(searchExcerptByteStart, index, locationStart);
            return {
                index: searchExcerptByteStart + index,
                length: this.foundByteStartIndex(foundIndex + sanitizedContent.length, htmlSearchExcerpt) - index
            }
        }
        return null;
    }

    private isFullStop(current: number): number {
        const result = this.FULL_STOPS.find(dot =>
            dot.every((byte, index) =>
                this.bookDataView.getUint8(current + index) === byte)
        );
        return result ? result.length : 0;
    }

    private surroundingSentences(highlightPosition: HighlightBytePosition, sentences = 1): SurroundingContent {
        // TODO this doesn't take into account dots that can be inside html tags, exclude them.

        let startDot = highlightPosition.index;
        let sentencesFound = 0;
        while (sentencesFound < sentences && startDot > 0) {
            startDot--;
            if (this.isFullStop(startDot))
                sentencesFound++;
        }
        startDot += this.isFullStop(startDot);
        // -4 (max utf length) accounts for a case when the last character is some kind of full stop
        let endDot = highlightPosition.index + highlightPosition.length - 4;
        sentencesFound = 0;
        while (sentencesFound < sentences && endDot < this.book.bytes.byteLength) {
            endDot++;
            if (this.isFullStop(endDot))
                sentencesFound++;
        }

        return {
            before: this.utfDecoder.decode(this.book.bytes.slice(startDot, highlightPosition.index))
                .replace(this.betweenRtTag_htmlTag, "").trim(),
            after: this.utfDecoder.decode(this.book.bytes.slice(highlightPosition.index + highlightPosition.length, endDot))
                .replace(this.betweenRtTag_htmlTag, "").trim()
        }
    }

    setSurroundings(highlights: Clipping[], sentencesNumber: number = 1) {
        _.sortBy(highlights, ["location.start"]).forEach(highlight => {
            const bytePosition = this.findHighlightByteIndex(highlight);
            if (bytePosition != null) {
                highlight.surrounding = highlight.surrounding || [];
                highlight.surrounding[sentencesNumber] = this.surroundingSentences(bytePosition, sentencesNumber);
            }
        })
    }

}

interface HighlightBytePosition {
    index: number;
    length: number;
}

export interface SurroundingContent {
    before: string;
    after: string;
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
