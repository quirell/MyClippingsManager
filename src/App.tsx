import React, {ChangeEvent} from 'react';
import './App.css';
import Display from "./Display";
import {Book, Clipping, Type} from "./clippings/Clipping";
import {parseClippingsFile} from "./clippings/ClippingsFIleParser";
import {joinNoteWithHighlightByLocation} from "./clippings/HighlightNoteMatcher";
import {Button} from "@material-ui/core";
import {defaultFilters, filterClippings, Filters} from "./filters/filterClippings";
import {getBookContent1, HighlightLocationMatcher} from "./mobi/HighlightLocationMatcher";
import {defaultDisplayOptions, DisplayOptions} from "./DisplayOptions";
import Header from "./Header";

const App: React.FC = () => {
    const openFilePickerRef: any = React.useRef();
    const clippingsRef = React.useRef<Clipping[]>([]);
    const [clippings, setClippings] = React.useState<Clipping[]>([]);
    const [filters, setFilters] = React.useState<Filters>(defaultFilters);
    const [displayOptions, setDisplayOptions] = React.useState<DisplayOptions>(defaultDisplayOptions);
    const [authors, setAuthors] = React.useState<string[]>([]);
    const [books, setBooks] = React.useState<Book[]>([]);

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
        const titles = new Set<string>();
        console.time("books");
        clippings.forEach(c => c.title && titles.add(c.title));
        const books: Book[] = Array.from(titles).map(title => ({title: title}));
        const kitchen = await getBookContent1();
        // const kitchenBook = books.find(b => b.title === "The Way of Kings")!;
        const kitchenBook = books.find(b => b.title === "キッチン")!;
        // const kitchenBook = books.find(b => b.title === "Trinitasシリーズ ドリーム・ライフ～夢の異世界生活～")!;
        // kitchenBook.locations = 18213;
        kitchenBook.locations = 2190;
        // kitchenBook.locations = 3451;
        kitchenBook.bytes = kitchen;
        const locationMatcher = new HighlightLocationMatcher(kitchenBook);
        // locationMatcher.setSurroundings(clippings.filter(c => c.title === "The Way of Kings" && c.type === Type.highlight));
        locationMatcher.setSurroundings(clippings.filter(c => c.title == "キッチン" && c.type == Type.highlight));
        // setHighlightsSurroundings(clippings.filter(c => c.title == "Trinitasシリーズ ドリーム・ライフ～夢の異世界生活～" && c.type == Type.highlight), kitchenBook);
        console.timeEnd("books");
        console.log("parsing end" + new Date().toISOString());
        setAuthors(Array.from(authors));
        setBooks(books);
        setClippings(clippings);
        console.log("rendering   end" + new Date().toISOString());
    };

    const setAndFilter = (filters: Filters) => {
        setFilters(filters);
        setClippings(filterClippings(clippingsRef.current, filters));
    };
    return (
        <div className="App">
            <input type="file" onChange={fileAdded} ref={openFilePickerRef} accept={"text/plain"} hidden={true}/>
            <Button variant="contained" onClick={() => openFilePickerRef.current.click()}>
                Select MyClippings File
            </Button>
            <br/>
            <Header filters={filters} setFilters={setAndFilter} authors={authors} books={books}
                    displayOptions={displayOptions} setDisplayOptions={setDisplayOptions}/>
            <br/>
            <Display clippings={clippings} displayOptions={displayOptions}/>
        </div>
    );
}

export default App;
