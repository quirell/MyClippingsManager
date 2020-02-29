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


function AddNotesToClippings(clippings: Clipping[]){
    const byBook = _.groupBy(clippings, c => c.title + c.author);
    //if one clipping in a book has a location then all have it
    const byBookWithLocation = _.pickBy(byBook, clippings => clippings[0].location !== undefined);
    for (let byBookWithLocationKey in byBookWithLocation) {

    }
    _.forEach(byBookWithLocation,book => {
        joinNoteWithHighlightByLocation(book)
    })
}

// It is basically the overlapping intervals algorithm
export function joinNoteWithHighlightByLocation(clippings: Clipping[]): Set<Clipping> {
    const highlights: Set<Clipping> = new Set();
    const updated = new Set<Clipping>();
    _(clippings)
        .flatMap(c => [new ClippingStart(c), new ClippingEnd(c)])
        .sortBy(["value", "sortOrder", "clipping.type"])
        .forEach((tip: ClippingTip) => {
            if (tip.clipping.type === Type.highlight) {
                if (tip instanceof ClippingStart)
                    highlights.add(tip.clipping);
                else
                    highlights.delete(tip.clipping);
            } else if (tip.clipping.type === Type.note) {
                highlights.forEach(h => {
                    if(!h.notes){
                        h.notes = [tip.clipping];
                        updated.has()
                    }
                    else if(!h.notes.find(c => c.id !== tip.clipping.id))
                        h.notes.push({id: tip.clipping.id,content: tip.clipping.content})
                });
            }
        });
    return updated;
}