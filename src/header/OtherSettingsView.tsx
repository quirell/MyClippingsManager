import {Button, createStyles, Icon, withStyles, WithStyles} from "@material-ui/core";
import React from "react";
import _ from "lodash";
import {RenderOptions} from "../export/renderer/ClippingsRenderer";
import ExportButton from "../export/ExportButton";
import Tooltip from "@material-ui/core/Tooltip";

const styles = createStyles({
    export: {
        margin: "-22px 9px 0 9px",
    },
    button: {
        opacity: 0.64
    }
});

export interface OtherSettings {
    renderOptions: RenderOptions,
}

export const defaultOtherSettings: OtherSettings = {
    renderOptions: {
        name: "Clippings Export.txt",
        clippingsPerPage: 10
    }
};

interface Props extends WithStyles<typeof styles> {
    otherSettings: OtherSettings
    setOtherSettings: (otherSettings: OtherSettings) => void
    exportClippings: () => void
    deleteAllVisible: () => void
}


function OtherSettingsView(props: Props) {
    const {classes, otherSettings, setOtherSettings, exportClippings} = props;
    const handleChange = (name: string, options: any) => {
        setOtherSettings(_.set({...otherSettings}, name, options));
    };

    return (
        <>
            <ExportButton
                renderOptions={otherSettings.renderOptions}

                setRenderOptions={(renderOptions) => handleChange("renderOptions", renderOptions)}
                export={exportClippings}/>
            <Tooltip
                title={"Delete all currently filtered clippings"}>
                <Button onClick={props.deleteAllVisible} className={classes.button}>
                    <Icon className={"fas fa-trash-alt"}/>
                </Button>
            </Tooltip>

        </>
    )
}

export default withStyles(styles)(OtherSettingsView);