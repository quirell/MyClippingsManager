import React, {ChangeEvent} from 'react';
import './App.css';
import Display from "./Display";
import {Book, Clipping} from "./clippings/Clipping";
import {parseClippingsFile} from "./clippings/ClippingsFIleParser";
import {Button, Icon, IconButton, LinearProgress} from "@material-ui/core";
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
import Tooltip from "@material-ui/core/Tooltip";
import {useSnackbar} from "notistack";
import clsx from "clsx";
import HelpModal from "./HelpModal";
import {SimilarityClassifier} from "./clippings/SimilarityClassifier";

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
    const {enqueueSnackbar} = useSnackbar();
    const [filters, setFilters] = React.useState<Filters>(defaultFilters);
    const [displayOptions, setDisplayOptions] = React.useState<DisplayOptions>(defaultDisplayOptions);
    const [otherSettings, _setOtherSettings] = React.useState<OtherSettings>(loadOtherSettings());
    const [authors, setAuthors] = React.useState<string[]>([]);
    const [titles, setTitles] = React.useState<string[]>([]);
    const [clippings, setClippings] = React.useState<Clipping[]>([]);
    const [clippingsCount, setClippingsCount] = React.useState<number>(0);
    const [locationModalOpen, setLocationModalOpen] = React.useState<boolean>(false);
    const [helpModalOpen, setHelpModalOpen] = React.useState<boolean>(false);
    const [processingFile, setProcessingFile] = React.useState<boolean>(false);
    const bookFile = React.useRef<File | null>(null);

    React.useEffect(() => {
        ClippingsStore.getAllAuthors().then(setAuthors);
        ClippingsStore.getAllTitles().then(setTitles);
        refreshClippings(filters)
        // only on init
    }, []);

    async function convertBook() : Promise<Book | null>{
        let htmlBook;
        try {
            htmlBook = await BookService.convertBook(bookFile.current!);
        } catch (e) {
            setProcessingFile(false);
            enqueueSnackbar(`Failed to extract html from book ${e.message}`);
            return null;
        }
        const book: Book = {...htmlBook, locations:0};
        await BookStore.addBook(book);
        bookFile.current = null;
        return book;
    }

    async function handleBookInternal(locations: number): Promise<void> {
        setLocationModalOpen(false);

        const book: Book | null = await convertBook();

        if(!book){
            setProcessingFile(false);
            return;
        }
        const bookHighlightFilter = {...defaultFilters, book: [book.title], highlight: true};
        const highlights = await ClippingsStore.getClippings(bookHighlightFilter, {
            startIndex: 0,
            stopIndex: Number.MAX_SAFE_INTEGER
        });
        const highlightLocationMatcher = new HighlightLocationMatcher(book);
        let matchedHighlightsCount;
        try {
            matchedHighlightsCount = highlightLocationMatcher.setSurroundings(highlights, 3);
        } catch (e) {
            setProcessingFile(false);
            enqueueSnackbar("Error processing book," +
                " maybe book doesn't match the one you read or the number of locations doesn't match ?");
            return;
        }
        await ClippingsStore.updateClippings(highlights);
        setProcessingFile(false);
        enqueueSnackbar(`Surrounding sentences found for
         ${matchedHighlightsCount}/${highlights.length} from book: ${book.title}`);
    }

    function handleBook(file: File) {
        setLocationModalOpen(true);
        bookFile.current = file;
    }

    async function handleMyClippings(file: File) {
        let clippings: Clipping[];
        try {
            clippings = await parseClippingsFile(file);
        } catch (e) {
            setProcessingFile(false);
            enqueueSnackbar(`Failed to process clippings file ${e.message}`);
            return;
        }

        const newClippings = await ClippingsStore.addAllClippings(clippings);
        await refreshAuthorsAndTitles();
        // This will refresh view, we need to do it every time new clippings get added
        refreshClippings(filters)
        // // kitchenBook.locations = 18213;
        // kitchenBook.locations = 2190;
        // // kitchenBook.locations = 3451;
        enqueueSnackbar(`Added new ${newClippings} clippings of total ${clippings.length} processed.`);
        setProcessingFile(false);
    }

    const fileAdded = async (ev: ChangeEvent<HTMLInputElement>) => {
        const files: (FileList | null) = ev.target.files;
        if (files == null || files.length !== 1)
            return;
        const file = files[0];
        try {
            BookService.ebookMediaType(file.name);
        } catch (e) {
            if (file.type !== "text/plain") {
                enqueueSnackbar("Only My Clippings.txt html, mobi, azw and azw3 files are supported.");
                return;
            }
        }
        console.log("start processing")
        setProcessingFile(true);
        if (file.type === "text/plain")
            await handleMyClippings(file);
        else
            handleBook(file);
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
        if (otherSettings.renderOptions.useBookTitle && otherSettings.renderOptions.postfix)
            name += otherSettings.renderOptions.postfix;
        const useIndex = contents.length > 1;
        if (otherSettings.emailConfiguration.sendToKindleEmail) {
            contents.forEach((content, index) =>
                sendEmail(content,
                    `${name} ${useIndex && index || ''}`.trim() + ".txt",
                    otherSettings.emailConfiguration));
        } else {
            contents.forEach((content, index) =>
                triggerDownload(content, `${name} ${useIndex && index || ''}`.trim() + ".txt"));
        }
    };

    const sendEmail = (content: string, name: string, emailConfiguration: EmailConfiguration) => {
        EmailService
            .sendClippings(name, content, emailConfiguration)
            .then(() => {
                enqueueSnackbar("Files were sent to your kindle email." +
                    "\n Make sure that myclippingsmanager@gmail.com is on your approved kindle email list." +
                    "\n Otherwise your files will not be delivered to your device.");
            })
            .catch((error) => {
                enqueueSnackbar(`Error sending email. ${error}`);
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
        let deletedIndex = 0;
        // TODO this code is probably too complicated, maybe should be replaced with something simpler
        for (let current of clippings) {
            // Remove clipping
            if (clipping === current) {
                deletedIndex = nextIndex;
                continue;
            }
            const index = _.findIndex(clippingsToUpdate, {id: current.id});
            // If the clipping was note there might be highlights from which note has been removed, so update them
            updatedClippings[nextIndex++] = index !== -1 ? clippingsToUpdate[index] : current;
        }
        if(deletedIndex > 0){
            // After delete we don't want to clear the cache of clippings before the removed element because it would
            // mess up colours
            SimilarityClassifier.clearCache({clipping:updatedClippings[deletedIndex-1],index:deletedIndex-1})
        }
        setClippings(updatedClippings);
        setClippingsCount(clippingsCount - 1);
        await refreshAuthorsAndTitles();
    };

    const saveClipping = async (clipping: Clipping) => {
        await ClippingsStore.updateClipping(clipping);
    };

    const setOtherSettings = (otherSettings: OtherSettings) => {
        _setOtherSettings(otherSettings);
        saveOtherSettings(otherSettings);
    }

    return (
        <div className="App">
            <input type="file" onChange={fileAdded} ref={openFilePickerRef} hidden={true} multiple={false}
                   accept={".txt,.html,.mobi,.azw,.azw3"}/>
            <IconButton size={"small"} style={{float: "right"}} onClick={() => setHelpModalOpen(true)}>
                <Icon className={"fas fa-question"}/>
            </IconButton>
            <div style={{display: "inline-block", margin: "auto"}}>
                <Tooltip
                    title={"Load \"My Clippings.txt\" or ebook (html, mobi, azw, azw3)." +
                    "\nEbooks are used to find sentences surrounding highlights."}>
                    <Button variant="contained" onClick={() => {
                        openFilePickerRef.current.value = null;
                        openFilePickerRef.current.click();
                    }} disableRipple={processingFile}>
                        <>MyClippings.txt / html / azw / azw3</>
                    </Button>
                </Tooltip>
                {
                    processingFile &&
                    <LinearProgress color={"secondary"}
                                    style={{marginTop: -4, borderBottomLeftRadius: 4, borderBottomRightRadius: 4}}/>
                }
            </div>
            <Header exportClippings={exportClippings} filters={filters} setFilters={refreshClippings} authors={authors}
                    titles={titles}
                    displayOptions={displayOptions} setDisplayOptions={setDisplayOptions}
                    deleteAllVisible={deleteAllVisible}
                    otherSettings={otherSettings} setOtherSettings={setOtherSettings}/>

            <Display displayOptions={displayOptions} clippingsCount={clippingsCount} clippings={clippings}
                     saveClipping={saveClipping}
                     removeNote={removeNote} removeClipping={removeClipping} loadClippings={loadMoreRows}/>
            <LocationModal open={locationModalOpen}
                           onCancel={() => {
                               setLocationModalOpen(false);
                               setProcessingFile(false);
                           }}
                           onLater={async () => {
                               setLocationModalOpen(false);
                               const book = await convertBook();
                               setProcessingFile(false);
                               if(book)
                                   enqueueSnackbar(`Converted ${book.title}`);
                           }}
                           onAccept={handleBookInternal}
            />
            <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
        </div>
    );
};

export default App;
