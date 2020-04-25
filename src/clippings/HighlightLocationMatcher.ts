import {Book, Clipping} from "./Clipping";
import _ from "lodash"


export class HighlightLocationMatcher {

    private readonly whitespace_betweenRtTag_htmlTag = /(<rt>.*?<\/rt>)|(<[^<]*>)|([\s　]+)/g;
    private readonly betweenRtTag_htmlTag = /(<rt>.*?<\/rt>)|(<[^<]*>)/g;
    private readonly utfEncoder = new TextEncoder();
    private readonly utfDecoder = new TextDecoder();
    private readonly FULL_STOPS = [".", "。", "｡"];
    private readonly FULL_STOP_BYTES = this.FULL_STOPS.map(dot => this.utfEncoder.encode(dot));

    private readonly SEARCH_RADIUS = 1000;
    private readonly MAX_SEARCH_RADIUS = 10000;
    // Found locations tend to grow farther from the location center as we're processing highlights and delta helps minimizing that difference
    private delta = 0;

    private readonly book: Required<Book>;
    private readonly bookDataView: DataView;
    private readonly locationSize: number;

    private readonly HTML_TAG_START = this.utfEncoder.encode("<");
    private readonly HTML_TAG_END = this.utfEncoder.encode(">");
    // @ts-ignore
    private bodyStartByte: number;
    // @ts-ignore
    private bodyEndByte: number;

    constructor(book: Book) {
        this.book = book;
        this.bookDataView = new DataView(this.book.bytes);
        this.locationSize = ~~(this.book.bytes.byteLength / this.book.locations);
        this.setBodyBoundaries();
    }

    private setBodyBoundaries() {
        let current = 0;
        const bodyStart = this.utfEncoder.encode("<body");
        while (current < this.bookDataView.byteLength && !this.isCharacter(current, bodyStart)) current++;
        this.bodyStartByte = current < this.bookDataView.byteLength ? current : 0;

        current = this.bookDataView.byteLength - 1;
        const bodyEnd = this.utfEncoder.encode("</body>");
        while (current > 0 && !this.isCharacter(current, bodyEnd)) current--;
        this.bodyEndByte = current > 0 ? current : this.bookDataView.byteLength;
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
        const result = this.FULL_STOP_BYTES.find(dot => this.isCharacter(current, dot));
        return result ? result.length : 0;
    }

    private isCharacter(current: number, character: Uint8Array): boolean {
        return character.every((byte, index) =>
            this.bookDataView.getUint8(current + index) === byte)
    }

    private surroundingSentences(highlightPosition: HighlightBytePosition, sentences = 1) {
        // TODO simplify the logic: decode part of string, count dots, if less than sentences, decode next part and so on.

        let startChar = highlightPosition.index;
        let sentencesFound = 0;
        let insideHtmlTag = false;
        while (sentencesFound < sentences && startChar > this.bodyStartByte) {
            startChar--;
            insideHtmlTag = (insideHtmlTag && !this.isCharacter(startChar, this.HTML_TAG_START)) ||
                (!insideHtmlTag && this.isCharacter(startChar, this.HTML_TAG_END));
            if (!insideHtmlTag && this.isFullStop(startChar))
                sentencesFound++;
        }
        startChar += this.isFullStop(startChar);
        // -4 (max utf length) accounts for the case when the last character is some kind of full stop
        let endChar = highlightPosition.index + highlightPosition.length - 4;
        sentencesFound = 0;
        insideHtmlTag = false;
        while (sentencesFound < sentences && endChar < this.bodyEndByte) {
            endChar++;
            insideHtmlTag = (!insideHtmlTag && this.isCharacter(endChar, this.HTML_TAG_START)) ||
                (insideHtmlTag && !this.isCharacter(endChar, this.HTML_TAG_END));
            if (!insideHtmlTag && this.isFullStop(endChar))
                sentencesFound++;
        }

        return {
            before: this.utfDecoder
                .decode(this.book.bytes.slice(startChar, highlightPosition.index))
                .replace(this.betweenRtTag_htmlTag, "").trim(),
            after: this.utfDecoder
                .decode(this.book.bytes.slice(highlightPosition.index + highlightPosition.length, endChar))
                .replace(this.betweenRtTag_htmlTag, "").trim()
        }
    }

    private splitSentences(input: string): string[] {
        const sentences: string[] = [];
        let i = -1;
        let sentenceStart = 0;
        while (++i < input.length) {
            if (this.FULL_STOPS.includes(input[i])) {
                sentences.push(input.substring(sentenceStart, i + 1));
                sentenceStart = i + 1;
            }
        }
        return sentences;
    }

    setSurroundings(highlights: Clipping[], sentencesNumber: number = 1) {
        _.sortBy(highlights, ["location.start"]).forEach(highlight => {
            const bytePosition = this.findHighlightByteIndex(highlight);
            if (bytePosition != null) {
                const surroundingContent = this.surroundingSentences(bytePosition, sentencesNumber);
                const before = this.splitSentences(surroundingContent.before);
                const after = this.splitSentences(surroundingContent.after);
                highlight.surrounding = {before, after};
            }
        })
    }

}

interface HighlightBytePosition {
    index: number;
    length: number;
}

export interface SurroundingContent {
    before: string[];
    after: string[];
}