import {DisplayOptions} from "../header/DisplayOptions";
import {Clipping} from "../clippings/Clipping";
import {createStyles, Typography, withStyles, WithStyles} from "@material-ui/core";
import React from "react";

const styles = createStyles({
    contentContainer: {
        display: "flex",
        justifyContent: "space-between",
        "& :first-child": {
            marginRight: "auto"
        }
    },
    surrounding: {
        color: "rgba(0,0,0,0.54)"
    },
    content: {
        textAlign: "left",
        marginTop: 10,
        marginLeft: 20
    }
});

interface Props extends WithStyles<typeof styles> {
    displayOptions: DisplayOptions
    clipping: Clipping
}

function View({classes, displayOptions, clipping}: Props) {
    return <Typography variant={"body2"} className={classes.content}>
        {displayOptions.surrounding.show && clipping.surrounding &&
        <span className={classes.surrounding}>
                            {clipping.surrounding.before.slice(0, displayOptions.surrounding.sentencesNumber)}
                        </span>}
        {clipping.modifiedContent || clipping.content}
        {displayOptions.surrounding.show && clipping.surrounding &&
        <span className={classes.surrounding}>
                            {clipping.surrounding.after.slice(0, displayOptions.surrounding.sentencesNumber)}
        </span>}
    </Typography>;
}

export default withStyles(styles)(View);