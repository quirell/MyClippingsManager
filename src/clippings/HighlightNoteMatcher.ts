import {Clipping, Type} from "./Clipping";
import _ from "lodash";

interface ClippingTip {
    value: number
    isEnd: boolean
    isNote: boolean
    clipping: Clipping
}

class ClippingStart implements ClippingTip {
    get value(): number {
        return this.clipping.location!.start;
    }

    readonly isEnd = false;
    isNote : boolean;
    constructor(public clipping: Clipping) {
        this.isNote = clipping.type === Type.note;
    }
}

class ClippingEnd implements ClippingTip {
    get value(): number {
        return this.clipping.location!.end;
    }

    readonly isEnd = true;
    isNote : boolean;
    constructor(public clipping: Clipping) {
        this.isNote = clipping.type === Type.note;
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
        .sortBy(["value", "isEnd", "isNote"])
        .forEach((tip: ClippingTip) => {
            if (tip.clipping.type === Type.highlight) {
                if (tip instanceof ClippingStart)
                    highlights.add(tip.clipping);
                else
                    highlights.delete(tip.clipping);
            } else if (tip.clipping.type === Type.note) {
                highlights.forEach(h => {
                    if(!h.noteIds){
                        h.noteIds =  [tip.clipping.id];
                        h.notes = [tip.clipping.content];
                        updated.add(h);
                    } else if(!h.noteIds!.find(id => id === tip.clipping.id)){
                        h.noteIds!.push(tip.clipping.id);
                        h.notes!.push(tip.clipping.content);
                        updated.add(h);
                    }
                });
            }
        });
    return updated;
}