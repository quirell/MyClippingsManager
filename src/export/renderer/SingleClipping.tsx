import {Clipping} from "../../clippings/Clipping";
import React from "react";
import {DisplayOptions} from "../../header/DisplayOptions";

interface SingleClippingProps {
    clipping: Clipping,
    displayOptions: DisplayOptions
}

export default function SingleClipping({clipping, displayOptions}: SingleClippingProps) {
    const {surrounding, showNotesWithHighlightsTogether} = displayOptions;
    return (
        <>
            {surrounding.show && clipping.surrounding && clipping.surrounding.before
            && <cite>{clipping.surrounding.before.slice(0, surrounding.sentencesNumber)}</cite>
            }
            <h4>{clipping.content}</h4>
            {surrounding.show && clipping.surrounding && clipping.surrounding.after
            && <cite>{clipping.surrounding.after.slice(0, surrounding.sentencesNumber)}</cite>
            }
            {showNotesWithHighlightsTogether && clipping.notes &&
            <>
                <br/>
                <ul>
                    {clipping.notes.map((note) => (<li><i>{note}</i></li>))}
                </ul>
            </>
            }
            <br/>
            <hr/>
        </>
    )
}