import React from 'react';
import {Button, ButtonGroup, Checkbox, createStyles, Icon, withStyles} from "@material-ui/core";
import ExportModal from "./ExportModal";
import {RenderOptions} from "./renderer/ClippingsRenderer";
import Tooltip from "@material-ui/core/Tooltip";
import {WithStyles} from "@material-ui/core/styles/withStyles";
import {rgbToHex} from "@material-ui/core/styles";


const styles = createStyles({
    content: {
        padding: "30px 60px"
    },
    item:{
        padding: "20px"
    },
    button: {
        opacity: 0.64
    }
});



interface Props extends WithStyles<typeof styles>{
    renderOptions: RenderOptions
    setRenderOptions: (options: RenderOptions) => void
    export: () => void
}

function ExportButton(props : Props) {
    const [open, setOpen] = React.useState(false);
    const close = () => {
        setOpen(false);
    };

    return (
        <ButtonGroup>
            <Tooltip title={"Export Clippings"}>
                <Button onClick={props.export} className={props.classes.button}>
                    <Icon className="fas fa-file-export"/>
                </Button>
            </Tooltip>
            <Tooltip title={"Export Settings"}>
                <Button onClick={() => setOpen(true)} className={props.classes.button} size={"small"}>
                    <Icon className="fas fa-cog"/>
                </Button>
            </Tooltip>
            <ExportModal
                setRenderOptions={props.setRenderOptions}
                open={open}
                onClose={close}
                renderOptions={props.renderOptions} />
        </ButtonGroup>
    );
}

export default withStyles(styles)(ExportButton)