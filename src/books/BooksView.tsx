import React from 'react';
import "react-table/react-table.css";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {BookStore} from "../storage/IndexedDbBookStore";
import {ClippingsStore} from "../storage/IndexedDbClippingStore";
import BookRow from "./BookRow";
import _ from "lodash";

const useStyles = makeStyles({
    table: {},
});

export default function BooksView() {
    const classes = useStyles();
    const [titles, setTitles] = React.useState<string[]>([])
    React.useEffect(() => {
        Promise.all([
                BookStore.getAllTitles(),
                ClippingsStore.getAllTitles()
            ]
        ).then((result) => setTitles(_.uniq(result.flatMap(titles => titles))))

    }, [])

    const removeTitle = (title: string) => {
        setTitles(titles.filter(t => t !== title));
    }

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell align="right">Locations</TableCell>
                        <TableCell align="right">Clippings</TableCell>
                        <TableCell align="right">(Removed)</TableCell>
                        <TableCell align="right">Edit</TableCell>
                        <TableCell align="right">Delete</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {titles.map(title => (<BookRow key={title} deleted={removeTitle} title={title}/>))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}





