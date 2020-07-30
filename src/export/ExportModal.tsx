import React from 'react';
import {
    Box,
    createStyles,
    Dialog,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
    withStyles,
    WithStyles
} from "@material-ui/core";
import {RenderOptions} from "./renderer/ClippingsRenderer";
import General from "./Tabs/General";
import Email from "./Tabs/Email";
import {EmailConfiguration} from "./email/EmailService";

const styles = createStyles({
    content: {
        minHeight: "400px"
    },
    box: {
        display: "flex",
        flexDirection: "column",
        // maxHeight: "80%",,
        justifyContent: "space-between",

        // minHeight: "350px"
    },
    item: {
        padding: "20px"
    }
});

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`wrapped-tabpanel-${index}`}
            {...other}
        >
            {children}
        </Box>
    );
}

interface Props extends WithStyles<typeof styles> {
    open: boolean
    onClose: () => void
    renderOptions: RenderOptions
    setRenderOptions: (options: RenderOptions) => void,
    emailConfiguration: EmailConfiguration,
    setEmailConfiguration: (config: EmailConfiguration) => void
}

function ExportModal({
                         open, onClose, classes,
                         renderOptions, setRenderOptions, emailConfiguration, setEmailConfiguration
                     }: Props) {
    const [openTab, setOpenTab] = React.useState(0);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setOpenTab(newValue);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth={true}
            maxWidth={"sm"}
        >
            <DialogTitle>Export Settings</DialogTitle>
            <DialogContent className={classes.content}>
                <Tabs
                    value={openTab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChange}
                    aria-label="disabled tabs example"
                    centered
                >
                    <Tab label="General"/>
                    <Tab label="Email"/>
                </Tabs>
                <div>
                    <TabPanel index={0} value={openTab}>
                        <General renderOptions={renderOptions} setRenderOptions={setRenderOptions}
                                 className={classes.box}/>
                    </TabPanel>
                    <TabPanel index={1} value={openTab}>
                        <Email configuration={emailConfiguration} setConfiguration={setEmailConfiguration}
                               className={classes.box}/>
                    </TabPanel>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default withStyles(styles)(ExportModal);