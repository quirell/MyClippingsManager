import React, {ChangeEvent} from 'react';
import './App.css';
import Display from "./Display";
import {Clipping} from "./clippings/Clipping";
import {parseClippingsFile} from "./clippings/ClippingsFIleParser";
import {joinNoteWithHighlightByLocation} from "./clippings/HighlightNoteMatcher";
import Filter from "./Filter";
import {Button} from "@material-ui/core";
import {Filters} from "./filters/filterClippings";

const App: React.FC = () => {
    const openFilePickerRef: any = React.useRef();
    const [clippings, setClippings] = React.useState<Clipping[]>([]);
    const [filters, setFilters] = React.useState<Filters>({
        dateTo: null,
        dateFrom: null,
        author: [],
        book: [],
        content: ""
    });
    const [authors, setAuthors] = React.useState<string[]>([]);
    const [books, setBooks] = React.useState<string[]>([]);
    const fileAdded = async (ev: ChangeEvent<HTMLInputElement>) => {
        const files: (FileList | null) = ev.target.files;
        if (files == null || files.length === 0)
            return;
        console.time("parsing");
        const clippings = await parseClippingsFile(files[0]);
        console.timeEnd("parsing");
        console.time("joining");
        joinNoteWithHighlightByLocation(clippings);
        console.timeEnd("joining");
        const authors = new Set<string>();
        console.time("authors");
        clippings.forEach(c => c.author && authors.add(c.author));
        console.timeEnd("authors");
        setAuthors(Array.from(authors));
        const books = new Set<string>();
        console.time("books");
        clippings.forEach(c => c.title && books.add(c.title));
        console.timeEnd("books");
        setBooks(Array.from(books));
        setClippings(clippings);
    };
    return (
        <div className="App">
            <input type="file" onChange={fileAdded} ref={openFilePickerRef} hidden={true}/>
            <Button variant="contained" onClick={() => openFilePickerRef.current.click()}>
                Select MyClippings File
            </Button>
            <br/>
            <Filter filters={filters} setFilters={setFilters} authors={authors} books={books}/>
            <br/>
            <Display clippings={clippings}/>
        </div>
    );
}

export default App;