import {RawClipping, readNextClipping} from "./ClippingReader";
import {Clipping} from "./Clipping";
import {LineReader} from "../utils/LineReader";
import {clippingParsers} from "./ClippingParsers";
import {ClippingParser} from "./ClippingParser";
import {findIndexOrError} from "../utils/Utils";

function moveParserToTheFront(parsers: ClippingParser[], parserIndex: number) {
    parsers.unshift(parsers.splice(parserIndex, 1)[0]);
}

function selectParser(clipping: RawClipping, parsers: ClippingParser[]): ClippingParser {
    const parserIndex = findIndexOrError(parsers, translation => translation.canParse(clipping), "Unsupported Language");
    // move found language to the beginning of languages array to save time next time
    // Insight is that usually clippings file is in a single language
    moveParserToTheFront(parsers, parserIndex);
    return parsers[0];
}

function parseClippings(lineReader: LineReader): Clipping[] {
    const clippings: Clipping[] = [];
    while (lineReader.hasNextLine) {
        let rawClipping;
        try {
            rawClipping = readNextClipping(lineReader);
        } catch (e) {
            console.error(e);
            throw new Error("My Clippings file format not recognized");
        }
        try {
            const parser = selectParser(rawClipping, clippingParsers);
            clippings.push(parser.parseClipping(rawClipping));
        } catch (e) {
            console.error(JSON.stringify({line: lineReader.readLinesNumber, ...rawClipping}));
            throw e;
        }
    }
    return clippings;
}

export async function parseClippingsFile(file: File): Promise<Clipping[]> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    }).then(result => parseClippings(new LineReader(result)));
}