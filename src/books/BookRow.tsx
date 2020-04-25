import React from 'react';
import "react-table/react-table.css";
import {Icon, IconButton, TableCell, TableRow} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {ClippingsStore} from "../storage/IndexedDbClippingStore";
import {BookStore} from "../storage/IndexedDbBookStore";
import {defaultFilters} from "../filters/filterClippings";
import clsx from "clsx";

const useStyles = makeStyles({
    table: {
        maxWidth: 650,
    },
});

interface Props {
    title: string,
    deleted: (title: string) => void
}

export default function BookRow({title, deleted}: Props) {
    const classes = useStyles();

    const [info, setInfo] = React
        .useState<{ locations?: number, clippings?: number, deleted?: number }>({})
    React.useEffect(() => {
        ClippingsStore
            .getCountByTitle(title)
            .then(clippings => setInfo(prev => ({...prev, clippings})));
        ClippingsStore
            .getCountByTitle(title, true)
            .then(deleted => setInfo(prev => ({...prev, deleted})))
        BookStore
            .getBook(title)
            .then(book => setInfo(prev => ({...prev, locations: book?.locations})));
    }, []);

    const deleteBookAndClippings = async (): Promise<void> => {
        await BookStore.deleteBook(title)
        await ClippingsStore.deleteClippings({...defaultFilters, book: [title]});
        deleted(title);
    };

    return (
        <TableRow>
            <TableCell component="th" scope="row">{title}</TableCell>
            <TableCell align="right">{info.locations}</TableCell>
            <TableCell align="right">{info.clippings}</TableCell>
            <TableCell align="right">{info.deleted}</TableCell>
            <TableCell align="right">Edit</TableCell>
            <TableCell align="right">
                <IconButton size={"small"} onClick={deleteBookAndClippings}>
                    <Icon className={clsx("fas fa-trash-alt")}/>
                </IconButton>
            </TableCell>
        </TableRow>
    )
}





