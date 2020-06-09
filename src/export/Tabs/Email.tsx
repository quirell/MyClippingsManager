import {
    Checkbox,
    createStyles,
    FormControlLabel,
    TextField,
    Typography,
    withStyles,
    WithStyles
} from "@material-ui/core";
import React from "react";
import {EmailConfiguration} from "../email/EmailService";
import CopyToClipboard from "./CopyToClipboard";


const styles = createStyles({
    content: {
        padding: "30px 60px"
    },
    item: {
        margin: "10px"
    }
});

interface Props extends WithStyles<typeof styles> {
    configuration: EmailConfiguration,
    setConfiguration: (configuration: EmailConfiguration) => void
    className?: any
}

export default withStyles(styles)(function Email({configuration, setConfiguration, className, classes}: Props) {
    const handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setConfiguration({...configuration, [name]: value});
    };
    return (
        <div className={className}>
            <TextField
                className={classes.item}
                label="Your amazon kindle email"
                onChange={handleChange("kindleEmail")}
                type={"email"}
                value={configuration.kindleEmail}/>
            <FormControlLabel
                className={classes.item}
                control={
                    <Checkbox
                        onChange={handleChange("sendToKindleEmail")}
                        checked={configuration.sendToKindleEmail}/>
                }
                label="Send to your Kindle E-mail"
            />
            <Typography>
                In order to recieve files sent to your device's kindle email you need to add&nbsp;
                <b>
                    myclippingsmanager@gmail.com
                    <CopyToClipboard value={"myclippingsmanager@gmail.com"}/>
                </b>
                to your approved kindle email list. Kindly find more information under that&nbsp;
                <a
                    href={"https://www.amazon.com/gp/help/customer/display.html?nodeId=GX9XLEVV8G4DB28H"}
                    target={"_blank"}>
                    link
                </a>
                .
            </Typography>
        </div>
    )
});