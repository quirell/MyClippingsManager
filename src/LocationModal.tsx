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
    onCancel: () => void
    onAccept: (locations: number) => void
}

function LocationModal({open, onCancel, onAccept, classes,}: Props) {
    const locationsRef: any = React.useRef();
    return (
        <Dialog
            open={open}
            onClose={onCancel}
        >
            <DialogTitle>Enter number of locations in the book</DialogTitle>
            <DialogContent>
                <Grid
                    className={classes.content}
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                >
                    <Grid item className={classes.item}><TextField
                        inputRef={locationsRef} inputProps={{min: "1"}}
                        label="Number of locations" defaultValue={1} type={"number"}/>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button color={"secondary"} size={"large"}
                        onClick={onCancel}>Dismiss</Button>
                <Button color={"primary"} size={"large"}
                        onClick={() => {
                            onAccept(Number(locationsRef.current.value))
                        }}>Accept</Button>
            </DialogActions>
        </Dialog>
    );
}

export default withStyles(styles)(LocationModal);