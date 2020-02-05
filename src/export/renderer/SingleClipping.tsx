import {Clipping} from "../../clippings/Clipping";
import React from "react";

interface SingleClippingProps {
    clipping: Clipping
}

export default function SingleClipping({clipping}: SingleClippingProps){
    return (
        <>
            {clipping.content}
            <br/>
        </>
    )
}