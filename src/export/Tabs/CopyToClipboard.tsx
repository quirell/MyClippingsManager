import React from 'react';
import {createStyles, Icon, IconButton, withStyles} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import {WithStyles} from "@material-ui/core/styles/withStyles";
import {useSnackbar} from "notistack";


const styles = createStyles({
    content: {
        padding: "30px 60px"
    },
    item: {
        padding: "20px"
    },
    button: {
        minWidth: "20px"
    }
});


interface Props extends WithStyles<typeof styles> {
    value: string
}

function CopyToClipboard(props: Props) {
    const {enqueueSnackbar} = useSnackbar();

    function copy() {
        const text = document.createElement("input");
        text.value = props.value;
        text.select();
        document.execCommand("copy");
        enqueueSnackbar(`${props.value} was copied to your clipboard!`)
    }

    return (
        <>{
            document.queryCommandSupported("copy") &&
            (<Tooltip title={"Copy to clipboard"}>
                <IconButton onClick={copy} className={props.classes.button} size={"small"}>
                    <Icon className="far fa-copy" fontSize={"small"}/>
                </IconButton>
            </Tooltip>)
        }</>
    );
}

export default withStyles(styles)(CopyToClipboard)