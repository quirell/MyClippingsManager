import React from 'react';
import {ButtonGroup, createStyles, Icon, IconButton, withStyles} from "@material-ui/core";
import ExportModal from "./ExportModal";
import {RenderOptions} from "./renderer/ClippingsRenderer";
import Tooltip from "@material-ui/core/Tooltip";
import {WithStyles} from "@material-ui/core/styles/withStyles";
import {EmailConfiguration} from "./email/EmailService";


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
    renderOptions: RenderOptions
    setRenderOptions: (options: RenderOptions) => void
    emailConfiguration: EmailConfiguration,
    setEmailConfiguration: (config: EmailConfiguration) => void
    export: () => void
}

function ExportButton(props: Props) {
    const [open, setOpen] = React.useState(false);
    const close = () => {
        setOpen(false);
    };

    return (
        <ButtonGroup>
            <Tooltip title={"Export Clippings"}>
                <IconButton onClick={props.export} className={props.classes.button}>
                    <Icon className="fas fa-file-export"/>
                </IconButton>
            </Tooltip>
            <Tooltip title={"Export Settings"}>
                <IconButton onClick={() => setOpen(true)} className={props.classes.button} size={"small"}>
                    <Icon className="fas fa-cog" fontSize={"small"}/>
                </IconButton>
            </Tooltip>
            <ExportModal
                setRenderOptions={props.setRenderOptions}
                setEmailConfiguration={props.setEmailConfiguration}
                emailConfiguration={props.emailConfiguration}
                open={open}
                onClose={close}
                renderOptions={props.renderOptions}/>
        </ButtonGroup>
    );
}

export default withStyles(styles)(ExportButton)