import React from 'react';
import {createStyles, Dialog, DialogContent, DialogTitle, withStyles, WithStyles} from "@material-ui/core";
import BooksView from "./BooksView";

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

function BooksModal({open, onClose, classes}: Props) {

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={"lg"}
        >
            <DialogTitle>Books</DialogTitle>
            <DialogContent>
                <BooksView/>
            </DialogContent>
        </Dialog>
    );
}

export default withStyles(styles)(BooksModal);