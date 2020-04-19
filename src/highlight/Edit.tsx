import {DisplayOptions} from "../header/DisplayOptions";
import {Clipping} from "../clippings/Clipping";
import {createStyles, TextField, withStyles, WithStyles} from "@material-ui/core";
import React from "react";
import {SaveClippingHandler} from "./Highlight";

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
    saveClipping: SaveClippingHandler
}

function Edit({classes, displayOptions, clipping, saveClipping}: Props) {

    const handleChange = (event: React.FocusEvent<HTMLInputElement>) => {
        clipping.modifiedContent = event.target.value as string;
        saveClipping(clipping);
    };

    // React.useEffect(() => {
    //
    //     return () => {
    //      TODO save on unmount
    //     }
    // }, [])
    //
    return <TextField fullWidth defaultValue={clipping.modifiedContent || clipping.content} onBlur={handleChange}
                      autoFocus/>;
    // return <Typography variant={"body2"} className={classes.content}>
    //     {displayOptions.surrounding.show && clipping.surrounding &&
    //     <span className={classes.surrounding}>
    //                         {clipping.surrounding.before.slice(0, displayOptions.surrounding.sentencesNumber)}
    //                     </span>}
    //     <TextField defaultValue={clipping.modifiedContent || clipping.content}  onBlur={handleChange} />
    //     {displayOptions.surrounding.show && clipping.surrounding &&
    //     <span className={classes.surrounding}>
    //                         {clipping.surrounding.after.slice(0, displayOptions.surrounding.sentencesNumber)}
    //     </span>}
    // </Typography>;
}

export default withStyles(styles)(Edit);