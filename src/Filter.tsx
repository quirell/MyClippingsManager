import {
    Card,
    Checkbox,
    createStyles,
    FormControl,
    Icon,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    WithStyles,
    withStyles
} from "@material-ui/core";
import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import {DatePicker, MaterialUiPickersDate, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {Filters} from "./filters/filterClippings";
import {Book} from "./clippings/Clipping";

const styles = createStyles({
    card: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        paddingTop: 15,
        paddingBottom: 15,
        margin: "4px 0 4px 0"
    },
    textField: {
        margin: "-22px 9px 0 9px",
    },
    numberInput: {
        margin: "-22px 9px 0 9px",
        width: 100,
    },
    multiselect: {
        margin: "-22px 9px 0 9px",
        minWidth: 100
    },
    datePicker: {
        margin: "-22px 9px 0 9px",
        width: 100
    }

});

interface Props extends WithStyles<typeof styles> {
    books: Book[],
    authors: string[],
    filters: Filters
    setFilters: (filters:Filters) => void
}

function Filter(props: Props) {
    const {classes, books, authors, filters, setFilters} = props;
    const handleChange = (name: string) => (event: React.ChangeEvent<any>) => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setFilters({...filters, [name]: value});
    };
    const handleDateChange = (name: string) => (date: MaterialUiPickersDate) => {
        setFilters({...filters, [name]: date});
    };
    return (
        <Card className={classes.card}>
            <Checkbox
                checked={filters.highlight}
                onChange={handleChange("highlight")}
                icon={<Icon className={"fas fa-highlighter"}/>}
                checkedIcon={<Icon className={"fas fa-highlighter"}/>}
            />
            <Checkbox
                checked={filters.note}
                onChange={handleChange("note")}
                icon={<Icon className={"fas fa-sticky-note"}/>}
                checkedIcon={<Icon className={"fas fa-sticky-note"}/>}
            />
            <Checkbox
                checked={filters.bookmark}
                onChange={handleChange("bookmark")}
                icon={<Icon className={"fas fa-bookmark"}/>}
                checkedIcon={<Icon className={"fas fa-bookmark"}/>}
            />
            <Checkbox
                checked={filters.joinedNoteHighlight}
                onChange={handleChange("joinedNoteHighlight")}
                icon={<Icon className={"fas fa-layer-group"}/>}
                checkedIcon={<Icon className={"fas fa-layer-group"}/>}
            />
            <Checkbox
                checked={filters.showSurrounding}
                onChange={handleChange("showSurrounding")}
                icon={<Icon className={"fas fa-arrows-alt-h"}/>}
                checkedIcon={<Icon className={"fas fa-layer-group"}/>}
            />
            <TextField className={classes.textField}
                       label={<Icon className={"fas fa-align-justify"}/>}
                       value={filters.content}
                       onChange={handleChange("content")}/>
            <TextField className={classes.numberInput}
                       value={filters.page}
                       type={"number"}
                       onChange={handleChange("page")}
                       label={<Icon className={"fa fa-file-alt"}/>}/>
            <TextField className={classes.numberInput}
                       value={filters.location}
                       type={"number"}
                       onChange={handleChange("location")}
                       label={<Icon className={"far fa-dot-circle"}/>}/>
            <FormControl className={classes.multiselect}>
                <InputLabel><Icon className={'fas fa-book'}/></InputLabel>
                <Select multiple
                        value={filters.book}
                        onChange={handleChange("book")}>
                    {books.map(book => <MenuItem key={book.title} value={book as any}>{book.title}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl className={classes.multiselect}>
                <InputLabel><Icon className={'fas fa-portrait'}/></InputLabel>
                <Select multiple
                        value={filters.author}
                        onChange={handleChange("author")}>
                    {authors.map(author => <MenuItem key={author} value={author}>{author}</MenuItem>)}
                </Select>
            </FormControl>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker className={classes.datePicker}
                            format={"d MMM yyyy"}
                            label={<React.Fragment> <Icon className={'far fa-calendar-alt'}/></React.Fragment>}
                            value={filters.dateFrom} onChange={handleDateChange("dateFrom")} inputVariant={"standard"}
                            clearable/>
                <DatePicker className={classes.datePicker}
                            format={"d MMM yyyy"}
                            label={<React.Fragment><Icon className={'far fa-calendar-alt'}/></React.Fragment>}
                            value={filters.dateTo} onChange={handleDateChange("dateTo")} inputVariant={"standard"}
                            clearable/>
            </MuiPickersUtilsProvider>
        </Card>
    )
}

export default withStyles(styles)(Filter);