import {Clipping, Type} from "./Clipping";
import _ from "lodash";

interface ClippingTip {
    value: number
    sortOrder: 0 | 1
    clipping: Clipping
}

class ClippingStart implements ClippingTip {
    get value(): number {
        return this.clipping.location!.start;
    }

    readonly sortOrder = 0;

    constructor(public clipping: Clipping) {
    }
}

class ClippingEnd implements ClippingTip {
    get value(): number {
        return this.clipping.location!.end;
    }

    readonly sortOrder = 1;

    constructor(public clipping: Clipping) {
    }
}

// It is basically the overlapping intervals algorithm
export function joinNoteWithHighlightByLocation(clippings: Clipping[]): void {
    const byBook = _.groupBy(clippings, c => c.title + c.author);
    //if one clipping in a book has a location then all have it
    const byBookWithLocation = _.pickBy(byBook, clippings => clippings[0].location !== undefined);
    const clippingTipsByBook = _.mapValues(byBookWithLocation, clippings => _.sortBy(
        _.flatMap(clippings, c => [new ClippingStart(c), new ClippingEnd(c)]),
        ["value", "sortOrder", "clipping.type"]));

    _.forEach(clippingTipsByBook, book => {
        const highlights: Set<Clipping> = new Set();

        book.forEach((tip: ClippingTip) => {
            if (tip.clipping.type === Type.highlight) {
                if (tip instanceof ClippingStart)
                    highlights.add(tip.clipping);
                else
                    highlights.delete(tip.clipping);
            } else if (tip.clipping.type === Type.note) {
                highlights.forEach(h => h.notes ?
                    h.notes.indexOf(tip.clipping) < 0 && h.notes.push(tip.clipping) :
                    h.notes = [tip.clipping]);
            }
        });
    });
}