import {Checkbox, createStyles, FormControlLabel, TextField, withStyles, WithStyles} from "@material-ui/core";
import React from "react";
import {RenderOptions} from "../renderer/ClippingsRenderer";


const styles = createStyles({
    content: {
        padding: "30px 60px"
    },
    item: {
        margin: "10px"
    },

});

interface Props extends WithStyles<typeof styles> {
    renderOptions: RenderOptions
    setRenderOptions: (options: RenderOptions) => void
    className?: any
}

export default withStyles(styles)(function General({renderOptions, setRenderOptions, className, classes}: Props) {
    const handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setRenderOptions({...renderOptions, [name]: value});
    };
    return (
        <div className={className}>
            <TextField
                className={classes.item}
                label="File Name"
                onChange={handleChange("name")}
                value={renderOptions.name}/>
            <FormControlLabel
                className={classes.item}
                control={
                    <Checkbox
                        onChange={handleChange("useBookTitle")}
                        checked={renderOptions.useBookTitle}/>
                }
                label="Use selected book title as a filename"
            />
            <TextField
                className={classes.item}
                label="Clippings Per Page"
                onChange={handleChange("clippingsPerPage")}
                type={"number"}
                value={renderOptions.clippingsPerPage}/>
            <TextField
                className={classes.item}
                label="Clippings Per File"
                onChange={handleChange("clippingsPerFile")}
                type={"number"}
                value={renderOptions.clippingsPerFile}/>

        </div>
    )
})