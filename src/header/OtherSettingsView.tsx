import {createStyles, withStyles, WithStyles} from "@material-ui/core";
import React from "react";
import _ from "lodash";
import {RenderOptions} from "../export/renderer/ClippingsRenderer";
import ExportButton from "../export/ExportButton";

const styles = createStyles({
    export: {
        margin: "-22px 9px 0 9px",
    },
});

export interface OtherSettings {
    renderOptions: RenderOptions
}

export const defaultOtherSettings : OtherSettings = {
    renderOptions: {
        name: "Clippings Export.txt",
        clippingsPerPage: 10
    }
};


interface Props extends WithStyles<typeof styles> {
    otherSettings: OtherSettings
    setOtherSettings: (otherSettings: OtherSettings) => void
}

function OtherSettingsView(props: Props) {
    const {classes, otherSettings, setOtherSettings} = props;
    const handleChange = (name: string, options: any) => {
        setOtherSettings(_.set({...otherSettings}, name, options));
    };

    return (
        <>
          <ExportButton
              renderOptions={otherSettings.renderOptions}
              setRenderOptions={(renderOptions) => handleChange("renderOptions",renderOptions)}
              export={() => {}}/>
        </>
    )
}

export default withStyles(styles)(OtherSettingsView);