import React from 'react';
import {Button, createStyles, Icon, withStyles} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import {WithStyles} from "@material-ui/core/styles/withStyles";
import BooksModal from "./BooksModal";


const styles = createStyles({
    content: {
        padding: "30px 60px"
    },
    item: {
        padding: "20px"
    },
    button: {
        opacity: 0.64
    }
});


interface Props extends WithStyles<typeof styles> {
}

function BooksButton(props: Props) {
    const [open, setOpen] = React.useState(false);
    const close = () => {
        setOpen(false);
    };

    return (
        <>
            <Tooltip title={"View Books"}>
                <Button onClick={() => setOpen(true)} className={props.classes.button}>
                    <Icon className="fas fa-book"/>
                </Button>
            </Tooltip>
            <BooksModal
                open={open}
                onClose={close}/>
        </>
    );
}

export default withStyles(styles)(BooksButton)