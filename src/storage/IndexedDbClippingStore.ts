import {Clipping, Type} from "../clippings/Clipping";
import Dexie from "dexie";
import _ from "lodash"
import {createClippingFilter, Filters} from "../filters/filterClippings";
import {joinNoteWithHighlightByLocation} from "../clippings/HighlightNoteMatcher";

export interface ClippingsStore {
    /**
     * Stores clippings and adds new notes to Highlights if any
     */
    addAllClippings(clippings: Clipping[]): Promise<void>

    getClippings(filters: Filters, page: Pagination): Promise<Clipping[]>

    /**
     * Marks the clipping as deleted and returns list clippings that have been modified by this process.
     */
    deleteClipping(id: string): Promise<Clipping[]>

    /**
     * Marks all the clippings selected by the filter as deleted
     */
    deleteClippings(filters: Filters): Promise<void>

    updateClipping(toUpdate: Clipping): Promise<void>

    updateClippings(toUpdate: Clipping[]): Promise<void>

    countClippings(filters: Filters): Promise<number>

    getAllAuthors(): Promise<string[]>

    getAllTitles(): Promise<string[]>
}

export interface Pagination {
    startIndex: number
    stopIndex: number
}

class IndexedDbClippingStore implements ClippingsStore {

    private db: Dexie & {
        clippings: Dexie.Table<Clipping, string>
    };

    constructor() {
        // @ts-ignore
        this.db = new Dexie("ClippingsDB");
        this.db.version(1).stores({
            clippings: "id,[deleted+title],*noteIds,[deleted+author],[title+location.start],date"
        });
    }

    async getClippings(filters: Filters, pagination: Pagination): Promise<Clipping[]> {
        const filter = createClippingFilter(filters);
        let query = null;
        if (filters.book.length > 0)
            query = this.db.clippings.orderBy("[title+location.start]");
        else
            query = this.db.clippings.orderBy("date");
        return query
            .filter(filter)
            .offset(pagination.startIndex)
            .limit(pagination.stopIndex - pagination.startIndex)
            .toArray()
    }

    async deleteClippings(filters: Filters) {
        const filter = createClippingFilter(filters);
        if (filters.note) {
            const onlyNotesFilter = createClippingFilter({...filters, highlight: false, bookmark: false});
            const noteIds = await this.db.clippings.filter(onlyNotesFilter).keys();
            const noteIdsToRemove = new Set(noteIds) as Set<string>;
            await this.db.clippings
                .where("noteIds").anyOf(noteIds)
                .modify(clipping => removeNoteById(clipping, noteIdsToRemove));
        }
        await this.db.clippings.filter(filter).modify({deleted: 1});
    }

    async deleteClipping(id: string): Promise<Clipping[]> {
        const clipping = await this.db.clippings.where("id").equals(id).first();
        if (!clipping)
            return Promise.reject(`Clipping ${id} doesn't exist`);
        await this.db.clippings
            .where("id").equals(id)
            .modify({deleted: 1});
        if (clipping.type === Type.note) {
            const highlightsToUpdate = await this.db.clippings.where("noteIds").equals(id).toArray();
            highlightsToUpdate.forEach(c => removeNoteById(c, new Set([id])));
            await this.db.clippings.bulkPut(highlightsToUpdate);
            return highlightsToUpdate;
        }
        return []
    }

    async addAllClippings(clippings: Clipping[]): Promise<void> {
        const rawKeys = await this.db.clippings.toCollection().primaryKeys();
        const keys = new Set(rawKeys);
        const newClippings = clippings.filter(c => !keys.has(c.id));
        const clippingsByBook = _(newClippings)
            .groupBy("title")
            .pickBy(clippings => clippings[0].location !== undefined)
            .value();
        let updatedClippings: Array<Clipping> = [];
        for (let book in clippingsByBook) {
            const bookClippings = clippingsByBook[book]!;
            const existing = await this.db.clippings
                .where("[deleted+title]")
                .equals(["false", book])
                .toArray();
            const updated = joinNoteWithHighlightByLocation([...existing, ...bookClippings]);
            updatedClippings = [...updatedClippings, ...existing.filter(c => updated.has(c))];
        }

        await this.db.clippings.bulkAdd(newClippings);
        await this.db.clippings.bulkPut(updatedClippings);
    }

    async updateClipping(toUpdate: Clipping): Promise<void> {
        await this.db.clippings.put(toUpdate);
    }

    async updateClippings(toUpdate: Clipping[]): Promise<void> {
        await this.db.clippings.bulkPut(toUpdate);
    }

    countClippings(filters: Filters): Promise<number> {
        const filter = createClippingFilter(filters);
        return this.db.clippings
            .filter(filter)
            .count();
    }

    async getAllAuthors(): Promise<string[]> {
        const keys = await this.db.clippings
            .where("[deleted+author]")
            .between([0, Dexie.minKey], [0, Dexie.maxKey])
            .uniqueKeys() as any[];
        return keys.map(key => key[1])
    }

    async getAllTitles(): Promise<string[]> {
        const keys = await this.db.clippings
            .where("[deleted+title]")
            .between([0, Dexie.minKey], [0, Dexie.maxKey])
            .uniqueKeys() as any[];
        return keys.map(key => key[1])
    }
}

export const ClippingsStore: ClippingsStore = new IndexedDbClippingStore();

function uniqueClippings(existingClippings: Clipping[], newClippings: Clipping[]): Clipping[] {
    return _.uniqWith([...existingClippings, ...newClippings], clippingsEqual)
}

function clippingsEqual(clipping1: Clipping, clipping2: Clipping) {
    return clipping1.title === clipping2.title &&
        clipping1.author === clipping2.author &&
        clipping1.date.getTime() === clipping2.date.getTime() &&
        (
            clipping1.location && clipping2.location &&
            (clipping1.location!.start === clipping2.location!.start &&
                clipping1.location!.end === clipping2.location!.end)
        ) ||
        clipping1.type === clipping2.type &&
        clipping1.content.valueOf() === clipping2.content.valueOf()
}

export function removeNoteById(clipping: Clipping, noteIdsToRemove: Set<string>) {
    const indexToDelete = clipping.noteIds!.findIndex(noteId => noteIdsToRemove.has(noteId));
    clipping.noteIds!.splice(indexToDelete, 1);
    clipping.notes!.splice(indexToDelete, 1);
}