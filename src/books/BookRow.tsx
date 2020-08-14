import React from 'react';
import "react-table/react-table.css";
import {Icon, IconButton, TableCell, TableRow, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {ClippingsStore} from "../storage/IndexedDbClippingStore";
import {BookStore} from "../storage/IndexedDbBookStore";
import {defaultFilters} from "../filters/filterClippings";
import clsx from "clsx";
import {HighlightLocationMatcher} from "../clippings/HighlightLocationMatcher";
import {useSnackbar} from "notistack";

const useStyles = makeStyles({
    table: {
        maxWidth: 650,
    },
});

interface Props {
    title: string,
    // deleted: (title: string) => void
    // restored: (title: string) => void
    hideDeleted: boolean
}

export default function BookRow({title, hideDeleted}: Props) {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [info, setInfo] = React
        .useState<{ locations?: number, clippings: number, deleted: number, noBook?: boolean }>({
            clippings: 0,
            deleted: 0
        });

    React.useEffect(() => {
        ClippingsStore
            .getCountByTitle(title)
            .then(clippings => setInfo(prev => ({...prev, clippings})));
        ClippingsStore
            .getCountByTitle(title, true)
            .then(deleted => setInfo(prev => ({...prev, deleted})))
        BookStore
            .getBook(title)
            .then(book => setInfo(prev => ({...prev, locations: book?.locations, noBook: !book})));
    }, []);

    const deleteBookAndClippings = async (): Promise<void> => {
        await BookStore.deleteBook(title)
        await ClippingsStore.deleteClippings({...defaultFilters, book: [title]});
        enqueueSnackbar(`Deleted book and  ${info.clippings} clippings.`);
        setInfo({...info, clippings: 0, deleted: info.deleted + info.clippings});
    };

    const restoreClippings = async (): Promise<void> => {
        const restoredClippings = await ClippingsStore.restoreClippings(title);
        enqueueSnackbar(`Restored ${restoredClippings} clippings.`);
        setInfo({...info, clippings: restoredClippings, deleted: 0});
    }

    const [editable, setEditable] = React.useState(false);

    const handleChange = (name: string) => (event: React.ChangeEvent<any>, value?: any) => {
        value = event.target.type === "checkbox" ? event.target.checked : value || event.target.value;
        setInfo({...info, [name]: value});
    };

    const updateLocations = async () => {
        const book = await BookStore.getBook(title);
        const bookHighlightFilter = {...defaultFilters, book: [title], highlight: true};
        const highlights = await ClippingsStore.getClippings(bookHighlightFilter, {
            startIndex: 0,
            stopIndex: Number.MAX_SAFE_INTEGER
        });
        const highlightLocationMatcher = new HighlightLocationMatcher(book!);
        let matchedHighlightsCount;
        try {
            matchedHighlightsCount = highlightLocationMatcher.setSurroundings(highlights, 3);
        } catch (e) {
            enqueueSnackbar("Error processing book," +
                " maybe book doesn't match the one you read or the number of locations doesn't match ?");
            return;
        }
        await ClippingsStore.updateClippings(highlights);
        enqueueSnackbar(`Surrounding sentences found for
         ${matchedHighlightsCount}/${highlights.length} from book: ${title}`);
        setEditable(false);
    }

    if (hideDeleted && info.clippings == 0) {
        return <></>
    }

    return (
        <TableRow>
            <TableCell component="th" scope="row">{title}</TableCell>
            <TableCell align="right">
                {editable &&
                <TextField
                    onChange={handleChange("locations")}
                    value={info.locations}
                    type={"number"}/>}
                {!editable && info.locations}
            </TableCell>
            <TableCell align="right">{info.clippings}</TableCell>
            <TableCell align="right">{info.deleted}</TableCell>
            <TableCell align="right">
                {
                    !editable &&
                    <IconButton size={"small"} onClick={() => setEditable(true)}>
                        <Icon className={clsx("fas fa-edit")}/>
                    </IconButton>
                }
                {
                    editable &&
                    <IconButton size={"small"} onClick={updateLocations}>
                        <Icon className={clsx("fas fa-save")}/>
                    </IconButton>
                }
            </TableCell>
            <TableCell align="right">
                <IconButton size={"small"} onClick={deleteBookAndClippings}>
                    <Icon className={clsx("fas fa-trash-alt")}/>
                </IconButton>
                <IconButton size={"small"} onClick={restoreClippings}>
                    <Icon className={clsx("fas fa-redo")}/>
                </IconButton>
            </TableCell>
        </TableRow>
    )
}





