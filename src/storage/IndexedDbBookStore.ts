import Dexie from "dexie";
import {Book} from "../clippings/Clipping";

interface BookStore {
    addBook: (book: Book) => Promise<void>
    getBook: (title: string) => Promise<Book | undefined>
}

class IndexedDbBookStore implements BookStore {

    private db: Dexie & { books: Dexie.Table<Book, string> };

    constructor() {
        // @ts-ignore
        this.db = new Dexie("BooksDB");
        this.db.version(1).stores({
            books: "title"
        });
    }

    async addBook(book: Book): Promise<void> {
        await this.db.books.put(book);
    }

    async getBook(title: string): Promise<Book | undefined> {
        return this.db.books.get(title);
    }
}

export const BookStore: BookStore = new IndexedDbBookStore();