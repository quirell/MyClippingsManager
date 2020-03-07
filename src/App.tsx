import React, {ChangeEvent} from 'react';
import './App.css';
import Display from "./Display";
import {Book, Clipping, Type} from "./clippings/Clipping";
import {parseClippingsFile} from "./clippings/ClippingsFIleParser";
import {Button} from "@material-ui/core";
import {defaultFilters, Filters} from "./filters/filterClippings";
import {getBookContent1, HighlightLocationMatcher} from "./clippings/HighlightLocationMatcher";
import {defaultDisplayOptions, DisplayOptions} from "./header/DisplayOptions";
import Header from "./header/Header";
import {ClippingsRenderer} from "./export/renderer/ClippingsRenderer";
import {defaultOtherSettings, OtherSettings} from "./header/OtherSettingsView";
import {ClippingsStore, Pagination, removeNoteById} from "./storage/IndexedDbClippingStore";
import {IndexRange} from "react-virtualized";
import _ from "lodash";

const App: React.FC = () => {
    const openFilePickerRef: any = React.useRef();

    const [filters, setFilters] = React.useState<Filters>(defaultFilters);
    const [displayOptions, setDisplayOptions] = React.useState<DisplayOptions>(defaultDisplayOptions);
    const [otherSettings, setOtherSettings] = React.useState<OtherSettings>(defaultOtherSettings);
    const [authors, setAuthors] = React.useState<string[]>([]);
    const [books, setBooks] = React.useState<Book[]>([]);
    const [titles, setTitles] = React.useState<string[]>([]);
    const [clippings, setClippings] = React.useState<Clipping[]>([]);
    const [clippingsCount, setClippingsCount] = React.useState<number>(0);

    React.useEffect(() => {
        ClippingsStore.getAllAuthors().then(setAuthors);
        ClippingsStore.getAllTitles().then(setTitles);
        setAndFilter(filters).then();
        // only on init
    },[]);

    function handleBook(file: File){
        const reader = new FileReader();
        reader.onload = async () => {
            // const book = await new BookService().convertBook(reader.result as ArrayBuffer);
            // const highlightLocationMatcher = new HighlightLocationMatcher(book);
            // const bookClippings = clippings.filter(c => c.title === book.title);
            // highlightLocationMatcher.setSurroundings(bookClippings);
            // // clippingStore.current.add()
            // // add authors from new clippings
            // // add books from new clippings
            //
            // setBooks(prev => [...prev,book]);

        };
        reader.readAsArrayBuffer(file);
    }

    async function handleMyClippings(file: File){
        const clippings = await parseClippingsFile(file);
        await ClippingsStore.addAllClippings(clippings);
        await refreshAuthorsAndTitles();
        // console.time("books");
        // const books: Book[] = Array.from(titles).map(title => ({title: title}));
        // const kitchen = await getBookContent1();
        // // const kitchenBook = books.find(b => b.title === "The Way of Kings")!;
        // const kitchenBook = books.find(b => b.title === "キッチン")!;
        // // const kitchenBook = books.find(b => b.title === "Trinitasシリーズ ドリーム・ライフ～夢の異世界生活～")!;
        // // kitchenBook.locations = 18213;
        // kitchenBook.locations = 2190;
        // // kitchenBook.locations = 3451;
        // kitchenBook.bytes = kitchen;
        // const locationMatcher = new HighlightLocationMatcher(kitchenBook);
        // // locationMatcher.setSurroundings(clippings.filter(c => c.title === "The Way of Kings" && c.type === Type.highlight));
        // locationMatcher.setSurroundings(clippings.filter(c => c.title == "キッチン" && c.type == Type.highlight));
        // // setHighlightsSurroundings(clippings.filter(c => c.title == "Trinitasシリーズ ドリーム・ライフ～夢の異世界生活～" && c.type == Type.highlight), kitchenBook);
        // console.timeEnd("books");

        // setBooks(books);
    }
    const fileAdded = async (ev: ChangeEvent<HTMLInputElement>) => {
        const files: (FileList | null) = ev.target.files;
        if (files == null || files.length === 0)
            return;
        for(let file of files){
            if(file.type === "text/plain")
                await handleMyClippings(file);
            else
                handleBook(file);
        }
    };

    const exportClippings = async () : Promise<void> => {
        const clippingsToExport = await ClippingsStore.getClippings(filters,{startIndex: 0, stopIndex: Number.MAX_SAFE_INTEGER});
        const renderer = new ClippingsRenderer(otherSettings.renderOptions,displayOptions,clippingsToExport);
        renderer.render();
    };

    const refreshAuthorsAndTitles = async (): Promise<void> => {
        const updatedAuthors = await ClippingsStore.getAllAuthors();
        const updatedTitles = await ClippingsStore.getAllTitles();
        const updatedAuthorFilter = filters.author.filter(a => _.includes(updatedAuthors, a));
        const updatedTitleFilter = filters.book.filter(b => _.includes(updatedTitles, b));
        if (authors.length !== updatedAuthors.length)
            setAuthors(updatedAuthors);
        if (titles.length !== updatedTitles.length)
            setTitles(updatedTitles);
        if ((filters.author.length !== updatedAuthorFilter.length) || (filters.book.length !== updatedTitleFilter.length)) {
            filters.author = updatedAuthorFilter;
            filters.book = updatedTitleFilter;
            await setAndFilter({...filters});
        }
    };

    const deleteAllVisible = async() : Promise<void> => {
        await ClippingsStore.deleteClippings(filters);
        setClippings([]);
        setClippingsCount(0);
        await refreshAuthorsAndTitles();
    };

    const setAndFilter = async (filters: Filters) : Promise<void>=> {
        setFilters(filters);
        ClippingsStore
            .countClippings(filters)
            .then(setClippingsCount)
            .then(() => ClippingsStore.getClippings(filters, {startIndex: 0, stopIndex: 30}))
            .then(setClippings);
    };

    const loadMoreRows = async (pagination: Pagination): Promise<void> => {
        const nextBatch = await ClippingsStore.getClippings(filters, pagination);
        setClippings([...clippings, ...nextBatch]);
    };

    const removeNote = async (clipping: Clipping, noteId: string) => {
        removeNoteById(clipping, new Set([noteId]));
        await ClippingsStore.updateClipping(clipping);
        setClippings(clippings.map(c => c === clipping ? {...clipping} : c));
    };

    const removeClipping = async (clipping: Clipping) => {
        const clippingsToUpdate = await ClippingsStore.deleteClipping(clipping.id);
        const updatedClippings = new Array(clippings.length - 1);
        let nextIndex = 0;
        // TODO this code is probably too complicated, maybe should be replaced with something simpler
        for (let current of clippings) {
            // Remove clipping
            if (clipping === current) continue;
            const index = _.findIndex(clippingsToUpdate, {id: current.id});
            // If the clipping was note there might be highlights from which note has been removed, so update them
            updatedClippings[nextIndex++] = index !== -1 ? clippingsToUpdate[index] : current;
        }
        setClippings(updatedClippings);
        setClippingsCount(clippingsCount - 1);
        await refreshAuthorsAndTitles();
    };

    return (
        <div className="App">
            <input type="file" onChange={fileAdded} ref={openFilePickerRef} accept={"text/plain"} hidden={true}/>
            <Button variant="contained" onClick={() => openFilePickerRef.current.click()}>
                Select MyClippings File
            </Button>
            <br/>
            <Header exportClippings={exportClippings} filters={filters} setFilters={setAndFilter} authors={authors} titles={titles}
                    displayOptions={displayOptions} setDisplayOptions={setDisplayOptions} deleteAllVisible={deleteAllVisible}
                    otherSettings={otherSettings} setOtherSettings={setOtherSettings} />
            <br/>
            <Display displayOptions={displayOptions} clippingsCount={clippingsCount} clippings={clippings}
                     removeNote={removeNote} removeClipping={removeClipping} loadClippings={loadMoreRows}/>
        </div>
    );
};

export default App;
