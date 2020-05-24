import {createStyles, Icon, IconButton, withStyles, WithStyles} from "@material-ui/core";
import React from "react";
import _ from "lodash";
import {RenderOptions} from "../export/renderer/ClippingsRenderer";
import ExportButton from "../export/ExportButton";
import Tooltip from "@material-ui/core/Tooltip";
import BooksButton from "../books/BooksButton";
import {EmailConfiguration} from "../export/email/EmailService";

const styles = createStyles({
    export: {
        // margin: "-22px 9px 0 9px",
    },
    button: {
        // opacity: 0.64
    }
});

export interface OtherSettings {
    renderOptions: RenderOptions
    emailConfiguration: EmailConfiguration
}

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
            <BooksButton/>
            <ExportButton
                renderOptions={otherSettings.renderOptions}
                emailConfiguration={otherSettings.emailConfiguration}
                setRenderOptions={(renderOptions) => handleChange("renderOptions", renderOptions)}
                setEmailConfiguration={(emailConfig) => handleChange("emailConfiguration", emailConfig)}
                export={exportClippings}/>
            <Tooltip
                title={"Delete all currently filtered clippings"}>
                <IconButton onClick={props.deleteAllVisible} className={classes.button}>
                    <Icon className={"fas fa-trash-alt"}/>
                </IconButton>
            </Tooltip>
        </>
    )
}

export default withStyles(styles)(OtherSettingsView);