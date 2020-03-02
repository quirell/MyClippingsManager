import React, {ChangeEvent} from 'react';
import './App.css';
import Display from "./Display";
import {Book, Type} from "./clippings/Clipping";
import {parseClippingsFile} from "./clippings/ClippingsFIleParser";
import {Button} from "@material-ui/core";
import {defaultFilters, Filters} from "./filters/filterClippings";
import {getBookContent1, HighlightLocationMatcher} from "./clippings/HighlightLocationMatcher";
import {defaultDisplayOptions, DisplayOptions} from "./header/DisplayOptions";
import Header from "./header/Header";
import {ClippingsRenderer} from "./export/renderer/ClippingsRenderer";
import {defaultOtherSettings, OtherSettings} from "./header/OtherSettingsView";
import {ClippingsStore} from "./storage/IndexedDbClippingStore";

const App: React.FC = () => {
    const openFilePickerRef: any = React.useRef();

    const [filters, setFilters] = React.useState<Filters>(defaultFilters);
    const [displayOptions, setDisplayOptions] = React.useState<DisplayOptions>(defaultDisplayOptions);
    const [otherSettings, setOtherSettings] = React.useState<OtherSettings>(defaultOtherSettings);
    const [authors, setAuthors] = React.useState<string[]>([]);
    const [books, setBooks] = React.useState<Book[]>([]);
    const [titles, setTitles] = React.useState<string[]>([]);

    React.useEffect(() => {
        ClippingsStore.getAllAuthors().then(setAuthors);
        ClippingsStore.getAllTitles().then(setTitles);
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
        setAuthors(await ClippingsStore.getAllAuthors());
        setTitles(await ClippingsStore.getAllTitles());
        setFilters({...filters});
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

    const setAndFilter = async (filters: Filters) : Promise<void>=> {
        setFilters(filters);
    };

    return (
        <div className="App">
            <input type="file" onChange={fileAdded} ref={openFilePickerRef} accept={"text/plain"} hidden={true}/>
            <Button variant="contained" onClick={() => openFilePickerRef.current.click()}>
                Select MyClippings File
            </Button>
            <br/>
            <Header exportClippings={exportClippings} filters={filters} setFilters={setAndFilter} authors={authors} titles={titles}
                    displayOptions={displayOptions} setDisplayOptions={setDisplayOptions}
                    otherSettings={otherSettings} setOtherSettings={setOtherSettings} />
            <br/>
            <Display filters={filters} displayOptions={displayOptions}/>
        </div>
    );
};

export default App;
