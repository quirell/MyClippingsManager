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
import {RenderOptions} from "./renderer/ClippingsRenderer";

const styles = createStyles({
    content: {
        padding: "30px 60px"
    },
    item:{
        padding: "20px"
    }
});

interface Props extends WithStyles<typeof styles>{
    open : boolean
    onClose: () => void
    renderOptions: RenderOptions
    setRenderOptions: (options: RenderOptions) => void
}

function ExportModal({open,onClose,classes,renderOptions,setRenderOptions}: Props) {

    const handleChange = (name: string) => (event: React.ChangeEvent<any>) => {
        setRenderOptions({...renderOptions, [name] : event.target.value});
    };
    return (
            <Dialog
                open={open}
                onClose={onClose}
            >
                <DialogTitle>Export Settings</DialogTitle>
                <DialogContent>
                <Grid
                    className={classes.content}
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                >
                    <Grid item className={classes.item}><TextField
                        label="File Name"
                        onChange={handleChange("name")}
                        value={renderOptions.name} />
                    </Grid>
                    <Grid item className={classes.item}><TextField
                        label="Clippings Per Page"
                        onChange={handleChange("clippingsPerPage")}
                        type={"number"}
                        value={renderOptions.clippingsPerPage} />
                    </Grid>
                    <Grid item className={classes.item}><TextField
                        label="Clippings Per File"
                        onChange={handleChange("clippingsPerFile")}
                        type={"number"}
                        value={renderOptions.clippingsPerFile} />
                    </Grid>
                </Grid>
                </DialogContent>
                <DialogActions>
                    <Button color={"secondary"} size={"large"} onClick={onClose}>Discard</Button>
                    <Button color={"primary"} size={"large"} onClick={onClose}>Save</Button>
                </DialogActions>
            </Dialog>
    );
}
export default withStyles(styles)(ExportModal);