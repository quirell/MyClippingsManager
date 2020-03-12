import {Book} from "./clippings/Clipping";

class _BookService {
    // TODO
    async convertBook(bookFile: File): Promise<Omit<Book, "locations">> {
        if (bookFile.type === "text/html")
            return this.convertHtmlBook(bookFile);
        return Promise.reject("File Format not yet supported");
    }

    private convertHtmlBook(bookFile: File): Promise<Omit<Book, "locations">> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                const title = bookFile.name.substring(0, bookFile.name.lastIndexOf("."));
                resolve({title: title, bytes: reader.result as ArrayBuffer});
            };
            reader.readAsArrayBuffer(bookFile);
        });
    }
}

export const BookService = new _BookService();