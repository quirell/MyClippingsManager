import {Book, Clipping, Type} from "../clippings/Clipping";
import Dexie from "dexie";
import _ from "lodash"
import {createClippingFilter, Filters} from "../filters/filterClippings";
import {joinNoteWithHighlightByLocation} from "../clippings/HighlightNoteMatcher";

interface ClippingsStore {
    addAllClippings(clippings: Clipping[]): Promise<void>
    getClippings(filters: Filters, page: Pagination): Promise<Clipping[]>
    deleteClipping(id: string): Promise<void>
    updateClipping(toUpdate: Clipping): Promise<void>
    getAllAuthors(): Promise<string[]>
    getAllTitles(): Promise<string[]>
}
interface Pagination{
    page: number
}

class IndexedDbClippingStore implements ClippingsStore{

    private db : Dexie & {
        clippings : Dexie.Table<Clipping,string>
        books : Dexie.Table<Book,string>
    };
    private pageSize = 50;

    constructor(){
        // @ts-ignore
        this.db = new Dexie("ClippingsDB");
        this.db.version(1).stores({
            clippings: "id,notes.id,title,author"
        });
    }

    async getClippings(filters: Filters, pagination: Pagination): Promise<Clipping[]> {
        const filter = createClippingFilter(filters);
        return this.db.clippings
            .filter(filter)
            .offset(pagination.page*this.pageSize)
            .limit(this.pageSize)
            .toArray()
    }

    async deleteClipping(id: string): Promise<void> {
        const clipping = await this.db.clippings.where("id").equals(id).first();
        if(!clipping)
            return Promise.reject(`Clipping ${id} doesn't exist`);
        if(clipping.type === Type.note){
            await this.db.clippings.where("notes.id").equals(id).modify(c => {
                const indexToDelete = c.notes!.findIndex(n => n.id === id);
                c.notes = c.notes!.splice(indexToDelete,1)
            })
        }
        await this.db.clippings.where("id").equals(id).modify({deleted: true})
    }
    // clippings to hash-clippings map
    // save
    // recompute notes and highlights for new books

    async addAllClippings(clippings: Clipping[]): Promise<void> {

        const rawKeys = await this.db.clippings.toCollection().primaryKeys();
        const keys = new Set(rawKeys);
        const newClippings = clippings.filter(c => !keys.has(c.id));
        const clippingsByBook = _(newClippings)
            .groupBy("title")
            .pickBy(clippings => clippings[0].location !== undefined)
            .value();
        let updatedClippings : Array<Clipping> = [];
        for (let book in clippingsByBook) {
            const bookClippings = clippingsByBook[book]!;
            const existing = await this.db.clippings
                .where("title")
                .equals(book)
                .toArray();
            const updated = joinNoteWithHighlightByLocation([...existing,...bookClippings]);
            updatedClippings = [...updatedClippings,...existing.filter(c => updated.has(c))]
        }

        await this.db.clippings.bulkAdd(newClippings);
        await this.db.clippings.bulkPut(updatedClippings);
    }

    async updateClipping(toUpdate:Clipping) : Promise<void> {
        await this.db.clippings.put(toUpdate);
    }

    async getAllAuthors() : Promise<string[]>{
        return this.db.clippings.orderBy("author").keys() as Promise<string[]>;
    }

    async getAllTitles() : Promise<string[]>{
        return this.db.clippings.orderBy("title").keys() as Promise<string[]>;
    }
}

export const ClippingsStore: ClippingsStore = new IndexedDbClippingStore();

function uniqueClippings(existingClippings: Clipping[], newClippings: Clipping[]) : Clipping[]{
    return _.uniqWith([...existingClippings,...newClippings],clippingsEqual)
}

function clippingsEqual(clipping1: Clipping,clipping2: Clipping){
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



