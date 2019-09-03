import {LineReader} from "../utils/LineReader";

export interface RawClipping {
    titleAuthorLine: string,
    metadataLine: string,
    emptyLine: string,
    contentLine: string
}

function extractContent(lineReader: LineReader): string {
    let content = "", line = "";
    do {
        content += line;
        line = lineReader.nextLine();
    } while (line !== "==========");
    return content;
}

export function readNextClipping(lineReader: LineReader): RawClipping {
    return {
        titleAuthorLine: lineReader.nextLine(),
        metadataLine: lineReader.nextLine(),
        emptyLine: lineReader.nextLine(),
        contentLine: extractContent(lineReader)
    }
}