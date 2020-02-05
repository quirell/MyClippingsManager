import {
    Checkbox,
    createStyles,
    FormControl,
    Icon,
    InputLabel,
    MenuItem,
    Select,
    withStyles,
    WithStyles
} from "@material-ui/core";
import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import _ from "lodash";
import {DisplayOptions} from "./DisplayOptions";

const styles = createStyles({
    select: {
        margin: "-22px 9px 0 9px",
    },
});

interface Props extends WithStyles<typeof styles> {
    displayOptions: DisplayOptions
    setDisplayOptions: (displayOptions: DisplayOptions) => void
}

function DisplayOptionsView(props: Props) {
    const {classes, displayOptions, setDisplayOptions} = props;
    const handleChange = (name: string) => (event: React.ChangeEvent<any>) => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setDisplayOptions(_.set({...displayOptions}, name, value));
    };
    return (
        <>
            <Tooltip title={displayOptions.showNotesWithHighlightsTogether ?
                "Show Highlights and Notes having the same location displayed together" :
                "Show Highlights and Notes having the same location displayed separately"}>
                <Checkbox
                    checked={displayOptions.showNotesWithHighlightsTogether}
                    onChange={handleChange("showNotesWithHighlightsTogether")}
                    icon={<Icon className={"fas fa-layer-group"}/>}
                    checkedIcon={<Icon className={"fas fa-layer-group"}/>}
                />
            </Tooltip>
            <Tooltip
                title={displayOptions.surrounding.show ? "Books' content surrounding Highlights visible" : "Books' content surrounding Highlights hidden"}>
                <Checkbox
                    checked={displayOptions.surrounding.show}
                    onChange={handleChange("surrounding.show")}
                    icon={<Icon className={"fas fa-arrows-alt-h"}/>}
                    checkedIcon={<Icon className={"fas fa-arrows-alt-h"}/>}
                />
            </Tooltip>
            <FormControl className={classes.select}>
                <InputLabel><Icon className={'fas fa-sort-numeric-up-alt'}/></InputLabel>
                <Tooltip title={"Number of surrounding sentences to show"}>
                    <Select
                        defaultValue={1}
                        value={displayOptions.surrounding.sentencesNumber}
                        onChange={handleChange("surrounding.sentencesNumber")}>
                        {_.range(1, 6).map(sentences => <MenuItem key={sentences}
                                                                  value={sentences}>{sentences}</MenuItem>)}
                    </Select>
                </Tooltip>
            </FormControl>
        </>
    )
}

export default withStyles(styles)(DisplayOptionsView);