import {
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
import React, {ChangeEvent} from "react";
import DateFnsUtils from "@date-io/date-fns";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {Autocomplete} from '@material-ui/lab';
import {Filters} from "../filters/filterClippings";
import Tooltip from "@material-ui/core/Tooltip";
import {SelectProps} from "@material-ui/core/Select";
import _ from "lodash";
const styles = createStyles({
    textField: {
        margin: "-22px 9px 0 9px",
    },
    numberInput: {
        margin: "-22px 9px 0 9px",
        width: 80,
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
    titles: string[],
    authors: string[],
    filters: Filters
    setFilters: (filters: Filters) => void
}

function Filter(props: Props) {
    const {classes, titles, authors} = props;
    const [filters, setFilters] = React.useState(props.filters);
    const debouncedSetFilters = React.useCallback(_.debounce(props.setFilters, 200), []);
    const handleChange = (name: string) => (event: React.ChangeEvent<any>) => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setFilters({...filters, [name]: value});
        debouncedSetFilters({...filters, [name]: value});
    };
    const handleDateChange = (name: string) => (date: any) => {
        setFilters({...filters, [name]: date});
        debouncedSetFilters({...filters, [name]: date});
    };
    return (
        <>
            <Tooltip title={filters.highlight ? "Highlights visible" : "Highlights hidden"}>
                <Checkbox
                    checked={filters.highlight}
                    onChange={handleChange("highlight")}
                    icon={<Icon className={"fas fa-highlighter"}/>}
                    checkedIcon={<Icon className={"fas fa-highlighter"}/>}
                />
            </Tooltip>
            <Tooltip title={filters.note ? "Notes visible" : "Notes hidden"}>
                <Checkbox
                    checked={filters.note}
                    onChange={handleChange("note")}
                    icon={<Icon className={"fas fa-sticky-note"}/>}
                    checkedIcon={<Icon className={"fas fa-sticky-note"}/>}
                />
            </Tooltip>
            <Tooltip title={filters.bookmark ? "Bookmarks visible" : "Bookmarks hidden"}>
                <Checkbox
                    checked={filters.bookmark}
                    onChange={handleChange("bookmark")}
                    icon={<Icon className={"fas fa-bookmark"}/>}
                    checkedIcon={<Icon className={"fas fa-bookmark"}/>}
                />
            </Tooltip>
            <Tooltip title={"Show only Clippings containing the given text"}>
                <TextField className={classes.textField}
                           label={<Icon className={"fas fa-align-justify"}/>}
                           value={filters.content}
                           onChange={handleChange("content")}/>
            </Tooltip>
            <Tooltip title={"Show only Clippings on the Page"}>
                <TextField className={classes.numberInput}
                           value={filters.page}
                           type={"number"}
                           onChange={handleChange("page")}
                           label={<Icon className={"fa fa-file-alt"}/>}/>
            </Tooltip>
            <Tooltip title={"Show only Clippings in the Location"}>
                <TextField className={classes.numberInput}
                           value={filters.location}
                           type={"number"}
                           onChange={handleChange("location")}
                           label={<Icon className={"far fa-dot-circle"}/>}/>
            </Tooltip>
            <FormControl className={classes.multiselect}>
                <InputLabel><Icon className={'fas fa-book'}/></InputLabel>
                {/*
                // @ts-ignore */}
                <Tooltip title={"Show only Clippings of selected books"}>
                    {/*<Autocomplete*/}
                    {/*    multiple={true}*/}
                    {/*    options={titles}*/}
                    {/*    value={filters.book}*/}
                    {/*    onChange={handleChange("book")}*/}
                    {/*    renderInput={(params) => (*/}
                    {/*        <TextField*/}
                    {/*            {...params}*/}
                    {/*            variant="standard"*/}
                    {/*            label="Multiple values"*/}
                    {/*            placeholder="Favorites"*/}
                    {/*        />*/}
                    {/*    )}*/}
                    {/*/>*/}
                    <Select multiple
                            value={filters.book}
                            onChange={handleChange("book")}>
                        {titles.map(title => <MenuItem key={title} value={title}>{title}</MenuItem>)}
                    </Select>
                </Tooltip>
            </FormControl>
            <FormControl className={classes.multiselect}>
                <InputLabel><Icon className={'fas fa-portrait'}/></InputLabel>
                <Tooltip title={"Show only clippings of selected authors"}>
                    <Select multiple
                            value={filters.author}
                            onChange={handleChange("author")}>
                        {authors.map(author => <MenuItem key={author} value={author}>{author}</MenuItem>)}
                    </Select>
                </Tooltip>
            </FormControl>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Tooltip title={"Show only Clippings created not earlier than the given date"}>
                    <div>
                        <DatePicker className={classes.datePicker}
                                    format={"d MMM yyyy"}
                                    label={<React.Fragment> <Icon className={'far fa-calendar-alt'}/></React.Fragment>}
                                    value={filters.dateFrom} onChange={handleDateChange("dateFrom")}
                                    inputVariant={"standard"}
                                    clearable/>
                    </div>
                </Tooltip>
                <Tooltip title={"Show only Clippings created not later than the given date"}>
                    <div>
                        <DatePicker className={classes.datePicker}
                                    format={"d MMM yyyy"}
                                    label={<React.Fragment><Icon className={'far fa-calendar-alt'}/></React.Fragment>}
                                    value={filters.dateTo} onChange={handleDateChange("dateTo")}
                                    inputVariant={"standard"}
                                    clearable/>
                    </div>
                </Tooltip>
            </MuiPickersUtilsProvider>
        </>
    )
}

export default withStyles(styles)(Filter);