import React from "react";
import {TooltipProps} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";

export default function HideOnFocusTooltip(props: TooltipProps) {
    const [opened, setOpened] = React.useState(false);
    const [blurred, setBlurred] = React.useState(true);
    const childProps: Partial<TooltipProps> = {
        onMouseOverCapture: () => {
            if (blurred) setOpened(true);
        },
        onMouseLeave: () => setOpened(false),
        onFocusCapture: () => {
            setBlurred(false);
            setOpened(false);
        },
        onBlurCapture: () => setBlurred(true)
    };
    return <Tooltip open={opened} {...props} >{React.cloneElement(props.children, childProps)}</Tooltip>;
}