import React, {ChangeEvent} from 'react';
import './App.css';
import Display from "./Display";
import {Book, Clipping} from "./clippings/Clipping";
import {parseClippingsFile} from "./clippings/ClippingsFIleParser";
import {Button} from "@material-ui/core";
import {defaultFilters, Filters} from "./filters/filterClippings";
import {HighlightLocationMatcher} from "./clippings/HighlightLocationMatcher";
import {defaultDisplayOptions, DisplayOptions} from "./header/DisplayOptions";
import Header from "./header/Header";
import {ClippingsRenderer} from "./export/renderer/ClippingsRenderer";
import {OtherSettings} from "./header/OtherSettingsView";
import {ClippingsStore, Pagination, removeNoteById} from "./storage/IndexedDbClippingStore";
import _ from "lodash";
import {BookService} from "./BookService";
import LocationModal from "./LocationModal";
import {BookStore} from "./storage/IndexedDbBookStore";
import {EmailConfiguration, EmailService} from "./export/email/EmailService";

function loadOtherSettings(): OtherSettings {
    const settings = localStorage.getItem("othersettings");
    if (settings)
        return JSON.parse(settings);
    return {
        renderOptions: {
            clippingsPerPage: 10,
            name: "Exported Clippings.txt"
        },
        emailConfiguration: {
            sendToKindleEmail: false,
            kindleEmail: "my-device-email@kindle.com"
        }
    }
}

function saveOtherSettings(settings: OtherSettings) {
    localStorage.setItem("othersettings", JSON.stringify(settings));
}


const App: React.FC = () => {
    const openFilePickerRef: any = React.useRef();

    const [filters, setFilters] = React.useState<Filters>(defaultFilters);
    const [displayOptions, setDisplayOptions] = React.useState<DisplayOptions>(defaultDisplayOptions);
    const [otherSettings, _setOtherSettings] = React.useState<OtherSettings>(loadOtherSettings());
    const [authors, setAuthors] = React.useState<string[]>([]);
    const [titles, setTitles] = React.useState<string[]>([]);
    const [clippings, setClippings] = React.useState<Clipping[]>([]);
    const [clippingsCount, setClippingsCount] = React.useState<number>(0);
    const [locationModalOpen, setLocationModalOpen] = React.useState<boolean>(false);
    const bookFile = React.useRef<File | null>(null);

    React.useEffect(() => {
        ClippingsStore.getAllAuthors().then(setAuthors);
        ClippingsStore.getAllTitles().then(setTitles);
        refreshClippings(filters)
        // only on init
    }, []);

    async function handleBookInternal(locations: number): Promise<void> {
        setLocationModalOpen(false);
        let htmlBook;
        htmlBook = await BookService.convertBook(bookFile.current!);

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

    function handleBook(file: File) {
        setLocationModalOpen(true);
        bookFile.current = file;
    }

    async function handleMyClippings(file: File) {
        const clippings = await parseClippingsFile(file);

        await ClippingsStore.addAllClippings(clippings);
        await refreshAuthorsAndTitles();
        // This will refresh view, we need to do it every time new clippings get added
        refreshClippings(filters)
        // // kitchenBook.locations = 18213;
        // kitchenBook.locations = 2190;
        // // kitchenBook.locations = 3451;
    }

    const fileAdded = async (ev: ChangeEvent<HTMLInputElement>) => {
        const files: (FileList | null) = ev.target.files;
        if (files == null || files.length === 0)
            return;
        for (let file of files) {
            if (file.type === "text/plain")
                await handleMyClippings(file);
            else
                handleBook(file);
        }
    };

    const exportClippings = async (): Promise<void> => {
        const clippingsToExport = await ClippingsStore.getClippings(filters, {
            startIndex: 0,
            stopIndex: Number.MAX_SAFE_INTEGER
        });
        const renderer = new ClippingsRenderer(otherSettings.renderOptions, displayOptions, clippingsToExport);
        const contents = renderer.render();
        let name = otherSettings.renderOptions.name;
        if (otherSettings.renderOptions.useBookTitle && filters.book.length === 1)
            name = filters.book[0];

        if (otherSettings.emailConfiguration.sendToKindleEmail) {
            contents.forEach((content, index) =>
                sendEmail(content,
                    `${index}_${name}`,
                    otherSettings.emailConfiguration));
        } else {
            contents.forEach((content, index) =>
                triggerDownload(content, `${index}_${name}`));
        }
    };

    const sendEmail = (content: string, name: string, emailConfiguration: EmailConfiguration) => {
        EmailService
            .sendClippings(name, content, emailConfiguration)
            .catch((error) => {
                alert(error);
            })
    }

    const triggerDownload = (content: string, name: string) => {
        const fileUrl = URL.createObjectURL(new Blob([content]));
        const downloadLink = document.createElement("a", {});
        downloadLink.hidden = true;
        downloadLink.download = name;
        downloadLink.href = fileUrl;
        downloadLink.click();
        downloadLink.remove();
    }

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
            refreshClippings({...filters, author: updatedAuthorFilter, book: updatedTitleFilter});
        }
    };

    const deleteAllVisible = async (): Promise<void> => {
        await ClippingsStore.deleteClippings(filters);
        await refreshAuthorsAndTitles();
    };

    const refreshClippings = (newFilters: Filters): void => {
        setFilters(newFilters);
        ClippingsStore
            .countClippings(newFilters)
            .then(setClippingsCount)
            .then(() => ClippingsStore.getClippings(newFilters, {startIndex: 0, stopIndex: 30}))
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

    const saveClipping = async (clipping: Clipping) => {
        await ClippingsStore.updateClipping(clipping);
    };

    const setOtherSettings = (otherSettings: OtherSettings) => {
        if (otherSettings.renderOptions.clippingsPerFile! < 1)
            otherSettings.renderOptions.clippingsPerFile = 1
        if (otherSettings.renderOptions.clippingsPerPage! < 1)
            otherSettings.renderOptions.clippingsPerPage = 1
        if (!otherSettings.emailConfiguration.kindleEmail.endsWith("@kindle.com")) {
            const at = otherSettings.emailConfiguration.kindleEmail.indexOf("@")
            const fixedEmail = otherSettings.emailConfiguration.kindleEmail.substring(0, at);
            otherSettings.emailConfiguration.kindleEmail = fixedEmail + "@kindle.com"
        }
        if (!otherSettings.renderOptions.name) {
            otherSettings.renderOptions.name = "Exported Clippings.txt"
        }
        if (!otherSettings.renderOptions.name!.endsWith(".txt")) {
            const dot = otherSettings.renderOptions.name.lastIndexOf(".")
            const fixedName = otherSettings.renderOptions.name.substring(0, dot);
            otherSettings.renderOptions.name = fixedName + ".txt"
        }
        _setOtherSettings(otherSettings);
        saveOtherSettings(otherSettings);
    }

    return (
        <div className="App">
            <input type="file" onChange={fileAdded} ref={openFilePickerRef} hidden={true}/>
            <Button variant="contained" onClick={() => openFilePickerRef.current.click()}>
                MyClippings.txt / html / azw / azw3
            </Button>
            <br/>
            <Header exportClippings={exportClippings} filters={filters} setFilters={refreshClippings} authors={authors}
                    titles={titles}
                    displayOptions={displayOptions} setDisplayOptions={setDisplayOptions}
                    deleteAllVisible={deleteAllVisible}
                    otherSettings={otherSettings} setOtherSettings={setOtherSettings}/>
            <br/>
            <Display displayOptions={displayOptions} clippingsCount={clippingsCount} clippings={clippings}
                     saveClipping={saveClipping}
                     removeNote={removeNote} removeClipping={removeClipping} loadClippings={loadMoreRows}/>
            <LocationModal open={locationModalOpen}
                           onCancel={() => setLocationModalOpen(false)}
                           onAccept={handleBookInternal}
            />
        </div>
    );
};

export default App;
