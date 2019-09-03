import {
    Card,
    Checkbox,
    createStyles,
    FormControl,
    Icon,
    InputLabel,
    Select,
    TextField,
    WithStyles,
    withStyles
} from "@material-ui/core";
import React, {useState} from "react";
import DateFnsUtils from "@date-io/date-fns";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";


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
    highlight?: boolean,
    note?: boolean,
    bookmark?: boolean,
    highlightNote?: boolean
}

function Filter(props: Props) {
    const {classes} = props;
    const [fromDate, setFromDate] = useState<Date | null>(null);
    return (
        <Card className={classes.card}>
            <Checkbox
                checked={props.note}
                value="highlight"
                icon={<Icon className={"fas fa-highlighter"}/>}
                checkedIcon={<Icon className={"fas fa-highlighter"}/>}
            />
            <Checkbox
                checked={props.bookmark}
                value="highlight"
                icon={<Icon className={"fas fa-sticky-note"}/>}
                checkedIcon={<Icon className={"fas fa-sticky-note"}/>}

            />
            <Checkbox
                checked={props.highlight}
                value="highlight"
                icon={<Icon className={"fas fa-bookmark"}/>}
                checkedIcon={<Icon className={"fas fa-bookmark"}/>}
            />
            <Checkbox
                checked={props.highlightNote}
                value="highlight"
                icon={<Icon className={"fas fa-layer-group"}/>}
                checkedIcon={<Icon className={"fas fa-layer-group"}/>}
            />
            <TextField className={classes.textField} label={<Icon className={"fas fa-align-justify"}/>}/>
            <TextField className={classes.numberInput} label={<Icon className={"fa fa-file-alt"}/>}/>
            <TextField className={classes.numberInput} label={<Icon className={"far fa-dot-circle"}/>}/>
            <FormControl className={classes.multiselect}>
                <InputLabel><Icon className={'fas fa-book'}/></InputLabel>
                <Select multiple></Select>
            </FormControl>
            <FormControl className={classes.multiselect}>
                <InputLabel><Icon className={'fas fa-portrait'}/></InputLabel>
                <Select multiple></Select>
            </FormControl>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker className={classes.datePicker}
                            format={"d MMM yyyy"}
                            label={<React.Fragment> <Icon className={'far fa-calendar-alt'}/></React.Fragment>}
                            value={fromDate} onChange={setFromDate} inputVariant={"standard"}
                            clearable/>
                <DatePicker className={classes.datePicker}
                            format={"d MMM yyyy"}

                            label={<React.Fragment><Icon className={'far fa-calendar-alt'}/></React.Fragment>}
                            value={fromDate} onChange={setFromDate} inputVariant={"standard"}
                            clearable/>
            </MuiPickersUtilsProvider>
        </Card>
    )
}

export default withStyles(styles)(Filter);