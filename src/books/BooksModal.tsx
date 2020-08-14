import React from 'react';
import {
    Checkbox,
    createStyles,
    Dialog,
    DialogContent,
    DialogTitle,
    Icon,
    withStyles,
    WithStyles
} from "@material-ui/core";
import BooksView from "./BooksView";
import Tooltip from "@material-ui/core/Tooltip";

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

    const [hideDeleted, setHideDeleted] = React.useState(true);
    const handleChange = (name: string) => (event: React.ChangeEvent<any>) => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setHideDeleted(value);
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={"lg"}
            fullWidth={true}
        >
            <DialogTitle>Books
                <Tooltip
                    title={hideDeleted ? "Items with all clippings removed hidden" : "All items visible"}>
                    <Checkbox
                        checked={hideDeleted}
                        onChange={handleChange("hideDeleted")}
                        icon={<Icon className={"fas fa-eye"} style={{width: "auto"}}/>}
                        checkedIcon={<Icon className={"fas fa-eye-slash"} style={{width: "auto"}}/>}
                    />
                </Tooltip>
            </DialogTitle>
            <DialogContent>
                <BooksView hideDeleted={hideDeleted}/>
            </DialogContent>
        </Dialog>
    );
}

export default withStyles(styles)(BooksModal);