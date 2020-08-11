import {Clipping, Type} from "../clippings/Clipping";
import Dexie from "dexie";
import _, {Dictionary} from "lodash"
import {createClippingFilter, Filters} from "../filters/filterClippings";
import {joinNoteWithHighlightByLocation} from "../clippings/HighlightNoteMatcher";
import {BookStore} from "./IndexedDbBookStore";
import {HighlightLocationMatcher} from "../clippings/HighlightLocationMatcher";

export interface ClippingsStore {
    /**
     * Stores clippings and adds new notes to Highlights if any
     * Returns number of added clippings
     */
    addAllClippings(clippings: Clipping[]): Promise<number>

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

    getAllTitles(includeDeleted?: boolean): Promise<string[]>

    getCountByTitle(title: string, deleted?: boolean): Promise<number>

    restoreClippings(title: string): Promise<number>
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
        return [];
    }

    private async assignSurroundings(clippingsByBook: Partial<Dictionary<Clipping[]>>) {
        const allTitles = new Set(await BookStore.getAllTitles());
        for (const [title, clippings] of Object.entries(clippingsByBook)) {
            if (!allTitles.has(title))
                continue;
            const highlights = clippings!.filter(clipping => clipping.type)
            const book = (await BookStore.getBook(title))!;
            const highlightLocationMatcher = new HighlightLocationMatcher(book);
            highlightLocationMatcher.setSurroundings(highlights, 3);
        }
    }


    async addAllClippings(clippings: Clipping[]): Promise<number> {
        const rawKeys = await this.db.clippings.toCollection().primaryKeys();
        const keys = new Set(rawKeys);
        const newClippings = clippings.filter(c => !keys.has(c.id));
        const clippingsByBook = _(newClippings)
            .groupBy("title")
            .pickBy(clippings => clippings[0].location !== undefined)
            .value();
        await this.assignSurroundings(clippingsByBook);
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
        return newClippings.length;
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

    async getAllTitles(includeDeleted = false): Promise<string[]> {

        const keys = await this.db.clippings
            .where("[deleted+title]")
            .between([0, Dexie.minKey], [(Number)(includeDeleted), Dexie.maxKey])
            .uniqueKeys() as any[];
        return keys.map(key => key[1])
    }

    async getCountByTitle(title: string, deleted = false): Promise<number> {
        return this.db.clippings
            .where("[deleted+title]")
            .equals([Number(deleted), title]).count()
    }

    async restoreClippings(title: string): Promise<number> {
        return await this.db.clippings
            .where("[deleted+title]")
            .equals([1, title])
            .modify({deleted: 0});
    }

}

export const ClippingsStore: ClippingsStore = new IndexedDbClippingStore();


export function removeNoteById(clipping: Clipping, noteIdsToRemove: Set<string>) {
    const indexToDelete = clipping.noteIds!.findIndex(noteId => noteIdsToRemove.has(noteId));
    clipping.noteIds!.splice(indexToDelete, 1);
    clipping.notes!.splice(indexToDelete, 1);
}