import {
    Checkbox,
    createStyles,
    FormControlLabel,
    Slider,
    TextField,
    Typography,
    withStyles,
    WithStyles
} from "@material-ui/core";
import React from "react";
import {RenderOptions} from "../renderer/ClippingsRenderer";


const styles = createStyles({
    content: {
        padding: "30px 60px"
    },
    item: {
        margin: "10px"
    },
    slider: {
        margin: "0 10"
    }
});

interface Props extends WithStyles<typeof styles> {
    renderOptions: RenderOptions
    setRenderOptions: (options: RenderOptions) => void
    className?: any
}

export default withStyles(styles)(function General({renderOptions, setRenderOptions, className, classes}: Props) {
    const handleChange = (name: string) => (event: React.ChangeEvent<any>, value?: any) => {
        if (event.target.type === "checkbox") {
            value = event.target.checked;
        } else if (event.target.type === "input") {
            value = event.target.value;
        }

        setRenderOptions({...renderOptions, [name]: value});
    };
    return (
        <form className={className}>
            <TextField
                disabled={renderOptions.useBookTitle}
                className={classes.item}
                label="File Name"
                onChange={handleChange("name")}
                placeholder={"exported-clippings.txt"}
                value={renderOptions.name}/>
            <FormControlLabel
                className={classes.item}
                control={
                    <Checkbox
                        onChange={handleChange("useBookTitle")}
                        checked={renderOptions.useBookTitle}/>
                }
                label="Use selected book title as filename"
            />
            <TextField
                disabled={!renderOptions.useBookTitle}
                className={classes.item}
                label="File Postfix"
                onChange={handleChange("postfix")}
                value={renderOptions.postfix}/>
            <TextField
                className={classes.item}
                label="Clippings Per Page"
                onChange={handleChange("clippingsPerPage")}
                type={"number"}
                placeholder={"DON'T DIVIDE INTO PAGES"}
                value={renderOptions.clippingsPerPage}/>
            <Typography gutterBottom>
                % of clippings per file
            </Typography>
            <Slider
                className={classes.slider}
                onChange={handleChange("clippingsPerFile")}
                value={renderOptions.clippingsPerFile}
                getAriaValueText={(value) => `${value}%`}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={10}
                marks
                min={10}
                max={100}
            />
        </form>
    )
})