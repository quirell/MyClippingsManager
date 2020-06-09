import {Book} from "./clippings/Clipping";
import axios, {AxiosResponse} from "axios";

class _BookService {

    private extension(fileName: string): string {
        return fileName.substring(fileName.lastIndexOf(".") + 1)
    }

    async convertBook(bookFile: File): Promise<Omit<Book, "locations">> {
        switch (this.extension(bookFile.name)) {
            case "html":
                return this.convertHtmlBook(bookFile);
            case "mobi":
            case "azw":
            case "azw3":
                return this.convertEbook(bookFile);
            default:
                throw new Error("File Format not supported");
        }
    }

    private convertHtmlBook(bookFile: File): Promise<Omit<Book, "locations">> {
        return bookFile
            .arrayBuffer()
            .then((bytes) => {
                const title = bookFile.name.substring(0, bookFile.name.lastIndexOf("."));
                return {title, bytes};
            });
    }

    ebookMediaType(fileName: string): string {
        switch (this.extension(fileName)) {
            case "mobi":
                return "application/x-mobipocket-ebook";
            case "azw":
                return "application/vnd.amazon.ebook"
            case "azw3":
                return "application/x-mobi8-ebook"
        }
        throw Error("Illegal State");
    }

    private async convertEbook(bookFile: File): Promise<Omit<Book, "locations">> {
        return axios
            .post<ArrayBuffer>(process.env.REACT_APP_CONVERT_URL, bookFile, {
                responseType: "arraybuffer",
                headers: {
                    "Content-Type": this.ebookMediaType(bookFile.name)
                }
            })
            .then((axiosResponse: AxiosResponse<ArrayBuffer>) => {
                const title = decodeURIComponent(escape(atob(axiosResponse.headers["x-title"])));
                return {title: title, bytes: axiosResponse.data};
            })
            .catch(error => {
                console.log(error);
                if (!error.response)
                    throw new Error("Unknown error");
                if (error.response.status === 400) {
                    throw new Error(error.response.data);
                } else if (error.response.status === 404) {
                    throw new Error("Couldn't connect to server");
                } else if (error.response.status === 500) {
                    throw new Error("Unexpected error");
                } else {
                    throw new Error("Unknown error");
                }
            });
    }
}

declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            REACT_APP_CONVERT_URL: string
            REACT_APP_EMAIL_URL: string
        }
    }
}

export const BookService = new _BookService();