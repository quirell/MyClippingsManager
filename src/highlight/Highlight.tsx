import React from "react"
import {
    Card,
    CardContent,
    createStyles,
    Icon,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
    WithStyles,
    withStyles
} from "@material-ui/core";
import {Clipping} from "../clippings/Clipping";
import clsx from "clsx";
import {DisplayOptions} from "../header/DisplayOptions";
import View from "./View";
import Edit from "./Edit";
import {SimilarityClassifier} from "../clippings/SimilarityClassifier";

const styles = createStyles({
    card: {
        margin: 4
    },
    header: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        "& :first-child": {
            marginRight: "auto"
        }
    },
    contentContainer: {
        display: "flex",
        justifyContent: "space-between",
        "& :first-child": {
            marginRight: "auto"
        }
    },
    typography: {
        display: "flex",
        alignItems: "center"
    },
    icon: {
        // verticalAlign: "middle",
        fontSize: 13,
        padding: 5,
        color: "rgba(0,0,0,0.54)"
    },
    buttonIcon: {
        fontSize: 15,
        padding: 5
    },
    surrounding: {
        color: "rgba(0,0,0,0.54)"
    },
    content: {
        textAlign: "left",
        marginTop: 10,
        marginLeft: 20
    },
    note: {
        marginTop: 10,
        // marginLeft: 40
    },
    group_zero: {},
    group_one: {
        backgroundColor: "rgba(245,0,87, 0.6)"
    },
    group_two: {
        backgroundColor: "rgba(63,81,181, 0.6)"
    }
});

export type RemoveHandler = (clipping: Clipping) => void;
export type RemoveNoteHandler = (clipping: Clipping, noteId: string) => void;
export type SaveClippingHandler = (clipping: Clipping) => void;

interface Props extends WithStyles<typeof styles> {
    clipping: Clipping
    style?: any
    displayOptions: DisplayOptions
    removeClipping: RemoveHandler
    removeNote: RemoveNoteHandler
    saveClipping: SaveClippingHandler
}


function Highlight(props: Props) {
    const {clipping, classes, style, displayOptions, removeClipping, removeNote} = props;
    const [edit, setEdit] = React.useState(false);
    const saveClipping = (clipping: Clipping) => {
        props.saveClipping(clipping);
        setEdit(false);
    };
    const group = React.useRef(classes.group_zero);
    if (displayOptions.groupSimilar) {
        if (group.current === classes.group_zero) {
            group.current = SimilarityClassifier.group(clipping) ? classes.group_one : classes.group_two;
        }
    } else {
        group.current = classes.group_zero;
    }
    return (
        <Card className={clsx(classes.card, group.current)} style={style}>
            <CardContent>
                <div className={classes.header}>
                    <Typography className={classes.typography} variant={"h5"}> <Icon component={"i"}
                                                                                     className={clsx(classes.icon, 'fas fa-book')}/>
                        {clipping.title}</Typography>
                    <Typography className={classes.typography} variant={"caption"}> <Icon
                        className={clsx(classes.icon, 'far fa-calendar-alt')}/>{clipping.date.toLocaleString("en-US",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            second: "numeric"
                        })}
                    </Typography>
                </div>
                <div className={classes.header}>
                    <Typography className={clsx(classes.typography)} variant={"overline"}><Icon
                        className={clsx(classes.icon, 'fas fa-portrait')}/>{clipping.author}</Typography>
                    {clipping.page &&
                    <Typography className={classes.typography} variant={"caption"}><Icon
                        className={clsx(classes.icon, 'fas fa-file-alt')}/>
                        {`${clipping.page.start} - ${clipping.page.end}`}
                    </Typography>}
                    {clipping.location &&
                    <Typography className={classes.typography} variant={"caption"}><Icon
                        className={clsx(classes.icon, 'far fa-dot-circle')}/>{`${clipping.location.start} - ${clipping.location.end}`}
                    </Typography>}
                </div>
                <div className={classes.contentContainer}>
                    {!edit && <View displayOptions={displayOptions} clipping={clipping}/>}
                    {edit && <Edit saveClipping={saveClipping} displayOptions={displayOptions} clipping={clipping}/>}
                    {!edit && <IconButton edge={"end"} size={"small"} onClick={() => setEdit(true)}>
                        <Icon className={clsx(classes.buttonIcon, "fas fa-edit")}/>
                    </IconButton>}
                    <IconButton edge={"end"} size={"small"} onClick={() => removeClipping(clipping)}>
                        <Icon className={clsx(classes.buttonIcon, "fas fa-trash-alt")}/>
                    </IconButton>
                </div>

                {displayOptions.showNotesWithHighlightsTogether &&
                clipping.notes && clipping.notes.length > 0 &&
                <List className={classes.note} dense>
                    {clipping.noteIds!.map((id, index) =>
                        (<ListItem key={id}>
                            <ListItemText inset primary={clipping.notes![index]}/>
                            <ListItemSecondaryAction>
                                <IconButton edge={"end"} size={"small"} onClick={() => removeNote(clipping, id)}>
                                    <Icon className={clsx(classes.buttonIcon, "fas fa-trash-alt")}/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>))}
                </List>}
            </CardContent>
        </Card>
    )
}

export default withStyles(styles)(Highlight);