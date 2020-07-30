import {Clipping} from "../../clippings/Clipping";
import {renderToString} from "react-dom/server";
import _ from "lodash"
import SingleClipping from "./SingleClipping";
import * as React from "react";
import {RenderBody} from "./RenderBody";
import {DisplayOptions} from "../../header/DisplayOptions";

export interface RenderOptions {
    name?: string,
    postfix?: string,
    clippingsPerPage?: number,
    clippingsPerFile?: number,
    useBookTitle?: boolean
}

export class ClippingsRenderer {
    private defaultedOptions: Required<RenderOptions>;

    constructor(options: RenderOptions,
                private displayOptions: DisplayOptions,
                private clippings: Clipping[]) {
        this.defaultedOptions = {
            name: "exported-clippings.txt",
            postfix: "",
            clippingsPerPage: clippings.length,
            clippingsPerFile: 100,
            useBookTitle: false,
            ..._.pickBy(options)
        };
    }

    render(): string[] {
        return _(this.clippings)
            .chunk(this.clippings.length * (this.defaultedOptions.clippingsPerFile / 100))
            .map(cs => this.renderSingle(cs, this.defaultedOptions, this.displayOptions))
            .value()
    }

    private renderSingle(clippings: Clipping[], options: Required<RenderOptions>, displayOptions: DisplayOptions) {
        const clippingViews = _(clippings)
            .chunk(options.clippingsPerPage)
            .map(cs =>
                `${renderToString(
                    <>
                        {
                            cs.map(c => (<SingleClipping clipping={c} displayOptions={displayOptions}/>))
                        }
                    </>
                )}<mbp:pagebreak />`
            )
            .join("");
        return renderToString(<RenderBody content={clippingViews}/>);
    }
}

