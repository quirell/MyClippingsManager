import React from 'react';
import {
    Button,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    withStyles,
    WithStyles
} from "@material-ui/core";
import CopyToClipboard from "./export/Tabs/CopyToClipboard";

const styles = createStyles({
    content: {
        padding: "30px 60px"
    },
    item: {
        padding: "20px"
    }
});

interface Props extends WithStyles<typeof styles> {
    open: boolean
    onClose: () => void
}

function HelpModal({open, onClose, classes}: Props) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>About MyClippings Manager</DialogTitle>
            <DialogContent>
                This application can be used to manage Kindle's MyClippings files.
                It stores the data only in your browser's local storage
                so there's currently no synchronization between devices.
                
                If you have any suggestions or want to report a bug,
                feel free to contact the developers via email&nbsp;
                <b>
                    myclippingsmanager@gmail.com
                    <CopyToClipboard value={"myclippingsmanager@gmail.com"}/>
                </b>
            </DialogContent>
            <DialogActions>
                <Button color={"secondary"} size={"large"} onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default withStyles(styles)(HelpModal);