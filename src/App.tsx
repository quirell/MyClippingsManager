import React, {ChangeEvent} from 'react';
import './App.css';
import Display from "./Display";
import {Clipping} from "./clippings/Clipping";
import {parseClippingsFile} from "./clippings/ClippingsFIleParser";
import {joinNoteWithHighlightByLocation} from "./clippings/HighlightNoteMatcher";
import Filter from "./Filter";
import {Button} from "@material-ui/core";
import {defaultFilters, filterClippings, Filters} from "./filters/filterClippings";

const App: React.FC = () => {
    const openFilePickerRef: any = React.useRef();
    const clippingsRef = React.useRef<Clipping[]>([]);
    const [clippings, setClippings] = React.useState<Clipping[]>([]);
    const [filters, setFilters] = React.useState<Filters>(defaultFilters);
    const [authors, setAuthors] = React.useState<string[]>([]);
    const [books, setBooks] = React.useState<string[]>([]);

    const fileAdded = async (ev: ChangeEvent<HTMLInputElement>) => {
        const files: (FileList | null) = ev.target.files;
        if (files == null || files.length === 0)
            return;
        console.log("starting" + new Date().toISOString());
        console.time("parsing");
        const clippings = await parseClippingsFile(files[0]);
        clippingsRef.current = clippings;
        console.timeEnd("parsing");
        console.time("joining");
        joinNoteWithHighlightByLocation(clippings);
        console.timeEnd("joining");
        const authors = new Set<string>();
        console.time("authors");
        clippings.forEach(c => c.author && authors.add(c.author));
        console.timeEnd("authors");
        const books = new Set<string>();
        console.time("books");
        clippings.forEach(c => c.title && books.add(c.title));
        console.timeEnd("books");
        console.log("parsing end" + new Date().toISOString());
        setAuthors(Array.from(authors));
        setBooks(Array.from(books));
        setClippings(clippings);
        console.log("rendering   end" + new Date().toISOString())
    };

    const setAndFilter = (filters:Filters) => {
        setFilters(filters);
        setClippings(filterClippings(clippingsRef.current,filters));
    };
    return (
        <div className="App">
            <input type="file" onChange={fileAdded} ref={openFilePickerRef} accept={"text/plain"} hidden={true}/>
            <Button variant="contained" onClick={() => openFilePickerRef.current.click()}>
                Select MyClippings File
            </Button>
            <br/>
            <Filter filters={filters} setFilters={setAndFilter} authors={authors} books={books}/>
            <br/>
            <Display clippings={clippings}/>
        </div>
    );
}

export default App;
