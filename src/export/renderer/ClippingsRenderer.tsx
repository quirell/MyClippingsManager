import {Clipping} from "../../clippings/Clipping";
import {renderToString} from "react-dom/server";
import _ from "lodash"
import SingleClipping from "./SingleClipping";
import * as React from "react";
import {RenderBody} from "./RenderBody";
import {DisplayOptions} from "../../header/DisplayOptions";

export interface RenderOptions {
    name?: string,
    clippingsPerPage?: number,
    clippingsPerFile?: number,
}

export class ClippingsRenderer {
    private defaultedOptions: Required<RenderOptions>;

    constructor(options: RenderOptions, private displayOptions: DisplayOptions, private clippings: Clipping[]){
        this.defaultedOptions = {
            name: "exported-clippings.txt",
            clippingsPerPage: 5,
            clippingsPerFile: clippings.length,
            ...options};
    }
    render(){
        _(this.clippings)
            .chunk(this.defaultedOptions.clippingsPerFile)
            .map(cs => this.renderSingle(cs,this.defaultedOptions,this.displayOptions))
            .map(content =>   _.delay(() => this.triggerDownload(content,this.defaultedOptions),300))
            .value()
    }

    private renderSingle(clippings: Clipping[],options: Required<RenderOptions>,displayOptions: DisplayOptions) {
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

    private triggerDownload(content:string,options: Required<RenderOptions>){
        const fileUrl = URL.createObjectURL( new Blob([content]));
        const downloadLink = document.createElement("a",{});
        downloadLink.hidden = true;
        downloadLink.download = options.name;
        downloadLink.href = fileUrl;
        downloadLink.click();
        downloadLink.remove();
    }
}

