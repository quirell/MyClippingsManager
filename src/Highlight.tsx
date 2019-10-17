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
import {Clipping} from "./clippings/Clipping";
import clsx from "clsx";
import {findHighlightPosition, getBookContent1} from "./mobi/LocationMatcher";

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
    content: {
        textAlign: "left",
        marginTop: 10,
        marginLeft: 20
    },
    note: {
        marginTop: 10,
        // marginLeft: 40
    }
});

interface Props extends WithStyles<typeof styles> {
    clipping: Clipping
    showNotes?: boolean;
    style?: any
}

function Highlight(props: Props) {
    const {clipping, showNotes, classes, style} = props;
    return (
        <Card className={classes.card} style={style} onClick={async () =>{
            const bookContent = await getBookContent1();
            const pos = await findHighlightPosition(clipping,bookContent,2190);
            console.log(pos)
        }}>
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
                    <Typography className={classes.typography} variant={"overline"}><Icon
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
                <div className={classes.header}>
                    <Typography variant={"body1"} className={classes.content}>{clipping.content}</Typography>
                    <IconButton edge={"end"} size={"small"}>
                        <Icon className={"fas fa-trash-alt"}/>
                    </IconButton>
                </div>

                {showNotes && clipping.notes && clipping.notes.length > 0 &&
                <List className={classes.note} dense>
                    {clipping.notes.map(note =>
                        (<ListItem key={note.date.getTime()}>
                            <ListItemText inset primary={note.content}/>
                            <ListItemSecondaryAction>
                                <IconButton edge={"end"} size={"small"}>
                                    <Icon className={"fas fa-trash-alt"}/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>))}
                </List>}
            </CardContent>

        </Card>
    )
}

export default withStyles(styles)(Highlight);