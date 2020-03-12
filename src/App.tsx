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
import {BookService} from "./BookService";
import LocationModal from "./LocationModal";
import {BookStore} from "./storage/IndexedDbBookStore";

const App: React.FC = () => {
    const openFilePickerRef: any = React.useRef();

    const [filters, setFilters] = React.useState<Filters>(defaultFilters);
    const [displayOptions, setDisplayOptions] = React.useState<DisplayOptions>(defaultDisplayOptions);
    const [otherSettings, setOtherSettings] = React.useState<OtherSettings>(defaultOtherSettings);
    const [authors, setAuthors] = React.useState<string[]>([]);
    const [titles, setTitles] = React.useState<string[]>([]);
    const [clippings, setClippings] = React.useState<Clipping[]>([]);
    const [clippingsCount, setClippingsCount] = React.useState<number>(0);
    const [locationModalOpen, setLocationModalOpen] = React.useState<boolean>(false);
    const bookFile = React.useRef<File | null>(null);

    React.useEffect(() => {
        ClippingsStore.getAllAuthors().then(setAuthors);
        ClippingsStore.getAllTitles().then(setTitles);
        refreshClippings(filters).then();
        // only on init
    },[]);

    async function handleBookInternal(locations: number): Promise<void> {
        setLocationModalOpen(false);
        const htmlBook = await BookService.convertBook(bookFile.current!);
        const book: Book = {...htmlBook, locations};
        await BookStore.addBook(book);
        const bookHighlightFilter = {...defaultFilters, book: [book.title], highlight: true};
        const highlights = await ClippingsStore.getClippings(bookHighlightFilter, {
            startIndex: 0,
            stopIndex: Number.MAX_SAFE_INTEGER
        });
        const highlightLocationMatcher = new HighlightLocationMatcher(book);
        highlightLocationMatcher.setSurroundings(highlights, 3);
        await ClippingsStore.updateClippings(highlights);
        bookFile.current = null;
    }

    function handleBook(file: File){
        setLocationModalOpen(true);
        bookFile.current = file;
    }

    async function handleMyClippings(file: File){
        const clippings = await parseClippingsFile(file);
        await ClippingsStore.addAllClippings(clippings);
        await refreshAuthorsAndTitles();
        // This will refresh view, we need to do it every time new clippings get added
        refreshClippings(filters).then();
        // // kitchenBook.locations = 18213;
        // kitchenBook.locations = 2190;
        // // kitchenBook.locations = 3451;
    }
    const fileAdded = async (ev: ChangeEvent<HTMLInputElement>) => {
        const files: (FileList | null) = ev.target.files;
        if (files == null || files.length === 0)
            return;
        for(let file of files){
            console.log(file.type);
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
        if (authors.length !== updatedAuthors.length)
            setAuthors(updatedAuthors);
        if (titles.length !== updatedTitles.length)
            setTitles(updatedTitles);
        // author or book may get removed if all clippings of that belonging to them get deleted
        const updatedAuthorFilter = filters.author.filter(a => _.includes(updatedAuthors, a));
        const updatedTitleFilter = filters.book.filter(b => _.includes(updatedTitles, b));

        if ((filters.author.length !== updatedAuthorFilter.length) ||
            (filters.book.length !== updatedTitleFilter.length)) {
            filters.author = updatedAuthorFilter;
            filters.book = updatedTitleFilter;
            await refreshClippings({...filters});
        }
    };

    const deleteAllVisible = async() : Promise<void> => {
        await ClippingsStore.deleteClippings(filters);
        setClippings([]);
        setClippingsCount(0);
        await refreshAuthorsAndTitles();
    };

    const refreshClippings = async (filters: Filters): Promise<void> => {
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
            <Header exportClippings={exportClippings} filters={filters} setFilters={refreshClippings} authors={authors}
                    titles={titles}
                    displayOptions={displayOptions} setDisplayOptions={setDisplayOptions} deleteAllVisible={deleteAllVisible}
                    otherSettings={otherSettings} setOtherSettings={setOtherSettings} />
            <br/>
            <Display displayOptions={displayOptions} clippingsCount={clippingsCount} clippings={clippings}
                     removeNote={removeNote} removeClipping={removeClipping} loadClippings={loadMoreRows}/>
            <LocationModal open={locationModalOpen}
                           onCancel={() => setLocationModalOpen(false)}
                           onAccept={handleBookInternal}
            />
        </div>
    );
};

export default App;
