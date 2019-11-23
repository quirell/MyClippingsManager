import {Card, createStyles, withStyles, WithStyles} from "@material-ui/core";
import {Book} from "./clippings/Clipping";
import {Filters} from "./filters/filterClippings";
import React from "react";
import {DisplayOptions} from "./DisplayOptions";
import DisplayOptionsView from "./DisplayOptionsView";
import Filter from "./Filter";
import Divider from "@material-ui/core/Divider";

const styles = createStyles({
    card: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        paddingTop: 15,
        paddingBottom: 15,
        margin: "4px 0 4px 0"
    }
});

interface Props extends WithStyles<typeof styles> {
    displayOptions: DisplayOptions
    setDisplayOptions: (displayOptions: DisplayOptions) => void
    books: Book[],
    authors: string[],
    filters: Filters
    setFilters: (filters: Filters) => void
}

function Header(props: Props) {


    return (
        <Card className={props.classes.card}>
            <DisplayOptionsView displayOptions={props.displayOptions} setDisplayOptions={props.setDisplayOptions}/>
            <Divider orientation={"vertical"}/>
            <Filter books={props.books} authors={props.authors} filters={props.filters} setFilters={props.setFilters}/>
        </Card>)
}

export default withStyles(styles)(Header);