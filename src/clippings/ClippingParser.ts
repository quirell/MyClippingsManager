import _ from "lodash";
import {Clipping, Metadata, Position, Type} from "./Clipping";
import {RawClipping} from "./ClippingReader";
import {findIndexOrError, matchOrError} from "../utils/Utils";

enum NavigationType {
    none = -1,
    page,
    location
}

interface Navigation extends Position {
    type: NavigationType
}

export class ClippingParser {
    constructor(private language: string, private types: string[], private navigationTypes: string[],
                private dayRegexp: RegExp, private months: string[], private yearRegexp: RegExp) {
    }

    private parseDate(datePart: string): Date {
        const timeRegexp = /\d\d?:\d\d?:\d\d?/;
        const timeMatch = matchOrError(datePart, timeRegexp, "Unsupported time format");
        const time = timeMatch[0].split(":").map(s => parseInt(s));
        const year = parseInt(matchOrError(datePart, this.yearRegexp, "Unsupported year format")[1]);
        const day = parseInt(matchOrError(datePart, this.dayRegexp, "Unsupported day format")[1]);
        const month = findIndexOrError(this.months, m => datePart.includes(m), "Unsupported month format");

        return new Date(year, month, day, time[0], time[1], time[2]);
    }

    private parseNavigationMethod(navigationPart: string): NavigationType {
        return this.navigationTypes.findIndex(type => navigationPart.includes(type));
    }

    private parseClippingType(metadataLine: string): Type {
        return findIndexOrError(this.types, type => metadataLine.includes(type), "Clipping type not found");
    }

    private parseNavigation(navigationPart: string): Navigation {
        const navigationRegexp = /\d+/g;
        const matches = matchOrError(navigationPart, navigationRegexp, "Navigation not found where it was expected");
        return {
            start: parseInt(matches[0]),
            end: matches.length === 2 ? parseInt(matches[1]) : parseInt(matches[0]),
            type: this.parseNavigationMethod(navigationPart)
        };
    }

    private static assignNavigationToMetadata(metadata: Metadata, navigation: Navigation) {
        navigation.type === NavigationType.location ? metadata.location = navigation : metadata.page = navigation;
    }

    private parseMetadata(metadataLine: string): Metadata {
        const parts = metadataLine.split("|");
        const metadata = {
            type: this.parseClippingType(metadataLine),
            date: this.parseDate(_.last(parts)!)
        };
        ClippingParser.assignNavigationToMetadata(metadata, this.parseNavigation(parts[0]));
        if (parts.length === 3) // Contains 2 navigations ( page and location)
            ClippingParser.assignNavigationToMetadata(metadata, this.parseNavigation(parts[1]));
        return metadata;
    }

    private static parseTitleLine(titleLine: string): { title: string, author?: string } {
        const titleAuthor = /(.*)\((.*)\)/;
        const match = titleLine.match(titleAuthor);
        if (!match) return {title: titleLine};
        return {title: match[1], author: match[2]};
    }

    canParse(rawClipping: RawClipping): boolean {
        return this.parseNavigationMethod(rawClipping.metadataLine) !== NavigationType.none;
    }

    parseClipping(rawClipping: RawClipping): Clipping {
        return {
            ...ClippingParser.parseTitleLine(rawClipping.titleAuthorLine),
            content: rawClipping.contentLine,
            ...this.parseMetadata(rawClipping.metadataLine)
        }
    }
}


