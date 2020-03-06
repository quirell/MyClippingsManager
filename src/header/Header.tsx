import {Card, createStyles, withStyles, WithStyles} from "@material-ui/core";
import {Book} from "../clippings/Clipping";
import {Filters} from "../filters/filterClippings";
import React from "react";
import {DisplayOptions} from "./DisplayOptions";
import DisplayOptionsView from "./DisplayOptionsView";
import Filter from "./Filter";
import Divider from "@material-ui/core/Divider";
import OtherSettingsView, {OtherSettings} from "./OtherSettingsView";

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
    titles: string[]
    authors: string[]
    filters: Filters
    setFilters: (filters: Filters) => void
    otherSettings: OtherSettings
    setOtherSettings: (otherSettings: OtherSettings) => void
    exportClippings: () => void
    deleteAllVisible: () => void
}

function Header(props: Props) {
    return (
        <Card className={props.classes.card}>
            <OtherSettingsView deleteAllVisible={props.deleteAllVisible} exportClippings={props.exportClippings} otherSettings={props.otherSettings} setOtherSettings={props.setOtherSettings}/>
            <Divider orientation={"vertical"}/>
            <DisplayOptionsView displayOptions={props.displayOptions} setDisplayOptions={props.setDisplayOptions}/>
            <Divider orientation={"vertical"}/>
            <Filter titles={props.titles} authors={props.authors} filters={props.filters} setFilters={props.setFilters}/>
        </Card>)
}

export default withStyles(styles)(Header);