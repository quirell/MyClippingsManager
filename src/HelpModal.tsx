import React from 'react';
import {
    Button,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
                <p>This application can be used to manage Kindle's MyClippings files.
                    It stores the data only in your browser's local storage
                    so there's currently no synchronization between devices.
                </p>
                <p>
                    You can add MyClippings.txt files, or books in html, mobi or azw3 format,
                    although they must not be encrypted, so you need to decrypt them using
                    for example the <a href={"https://calibre-ebook.com/"}>Calibre</a> software.
                </p>
                <p>
                    The book will be matched by the title with the clippings you loaded and the highlights will be shown
                    including the sentence surrounding it.
                    Be aware that you need to upload the exact book you read on your Kindle device for it to work
                    flawlessly.
                </p>
                <p>
                    If you have any suggestions or want to report a bug - and there definitely are some bugs -
                    feel free to contact me via email&nbsp;
                    <b>
                        myclippingsmanager@gmail.com
                        <CopyToClipboard value={"myclippingsmanager@gmail.com"}/>
                    </b>
                </p>
                <p>Supported languages of MyClippings file: English, Japanese, Spanish and Italian</p>
            </DialogContent>
            <DialogActions>
                <Button color={"secondary"} size={"large"} onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default withStyles(styles)(HelpModal);