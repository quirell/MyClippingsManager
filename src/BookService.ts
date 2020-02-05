import {Book} from "./clippings/Clipping";


export class BookService{

    async convertBook(book: ArrayBuffer) : Promise<Book> {
        return {
            bytes: book,
            locations: 0,
            title: ""
        }
    }
}