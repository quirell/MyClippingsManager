import {Book, Clipping} from "../clippings/Clipping";
import Dexie from "dexie";
import _ from "lodash"

interface ClippingsStore {
    add(clippings: Clipping[]) : Promise<void>
    all() : Promise<Clipping[]>
    delete(clipping: Clipping) : Promise<void>
}
//
// export class ClippingsStoreImpl implements ClippingsStore{
//     private clippings : Clipping[];
//
//     private db : Dexie & {clippings : Dexie.Table<Clipping,string>, books : Dexie.Table<Book,string>};
//
//     constructor(){
//         // @ts-ignore
//         this.db = new Dexie("ClippingsDB");
//         this.db.version(1).stores({
//             clippings: "id,notes.id",
//             books: "title",
//             authors: "name"
//         });
//     }
//
//     private async initClippings() : Promise<void>{
//         if(!this.clippings)
//             this.clippings = (await this.db.clippings.toCollection().toArray());
//     }
//
//
//     async all(): Promise<Clipping[]> {
//         await this.initClippings();
//         return this.clippings;
//     }
//
//     async delete(clipping: Clipping): Promise<void> {
//         await this.initClippings();
//         await this.db.clippings.delete(clipping.id);
//         const notes = await this.db.clippings.where({"notes.id" : clipping.id});
//         notes.toArray()
//         this.clippings.splice(this.clippings.indexOf(clipping),1);
//
//     }
//
//     add(newClippings: Clipping[]): Promise<void> {
//         let nextId = Number(_.last(this.clippings)!.id)+1;
//         this.clippings = uniqueClippings(this.clippings,newClippings);
//         const notSavedClippings = _.takeRightWhile(this.clippings, c => c.id === "");
//         notSavedClippings.forEach( c => c.id = (nextId++).toString());
//         return this.db.clippings.bulkAdd(notSavedClippings).then(s => {})
//     }
//
//     updateClippings(toUpdate: Clipping[]) : Promise<void> {
//
//     }
//
//
//     async addBook(book: Book): Promise<void>{
//         await this.db.books.add(book)
//     }
//
//     async allBooks() : Promise<Book[]>{
//         return this.db.books.toArray()
//     }
// }
//
// export const ClippingsStore: ClippingsStore = new ClippingsStoreImpl();
//
// function uniqueClippings(existingClippings: Clipping[], newClippings: Clipping[]) : Clipping[]{
//     return _.uniqWith([...existingClippings,...newClippings],clippingsEqual)
// }
//
// function clippingsEqual(clipping1: Clipping,clipping2: Clipping){
//     return clipping1.title === clipping2.title &&
//         clipping1.author === clipping2.author &&
//         clipping1.date.getTime() === clipping2.date.getTime() &&
//         (
//             clipping1.location && clipping2.location &&
//                 (clipping1.location!.start === clipping2.location!.start &&
//                 clipping1.location!.end === clipping2.location!.end)
//         ) ||
//         clipping1.type === clipping2.type &&
//         clipping1.content.valueOf() === clipping2.content.valueOf()
// }
//
//
//
