import {Clipping} from "../../clippings/Clipping";
import React from "react";
import {DisplayOptions} from "../../header/DisplayOptions";

interface SingleClippingProps {
    clipping: Clipping,
    displayOptions: DisplayOptions
}

export default function SingleClipping({clipping,displayOptions}: SingleClippingProps){
    const { surrounding, showNotesWithHighlightsTogether } = displayOptions;
    return (
        <>
            <p>{clipping.content}</p>
            { showNotesWithHighlightsTogether && clipping.notes &&
                <li>
                    {clipping.notes.map((note) => (<ul><i>{note}</i></ul>))}
                </li>
            }
            <br/>
        </>
    )
}