import {Clipping} from "../../clippings/Clipping";
import {renderToString} from "react-dom/server";
import _ from "lodash"
import SingleClipping from "./SingleClipping";
import * as React from "react";
import {RenderBody} from "./RenderBody";

export interface RenderOptions {
    name?: string,
    clippingsPerPage?: number,
    clippingsPerFile?: number
}

export class ClippingsRenderer {

    render(clippings: Clipping[], options: RenderOptions){
        const defaultedOptions: Required<RenderOptions> = {
            name: "exported-clippings.txt",
            clippingsPerPage: 5,
            clippingsPerFile: clippings.length,
            ...options};
        _(clippings)
            .chunk(defaultedOptions.clippingsPerFile)
            .map(cs => this.renderSingle(cs,defaultedOptions))
            .map(content =>   _.delay(() => this.triggerDownload(content,defaultedOptions),300))
            .value()
    }

    private renderSingle(clippings: Clipping[],options: Required<RenderOptions>) {
        const clippingViews = _(clippings)
            .chunk(options.clippingsPerPage)
            .map(cs =>
                `${renderToString(
                    <>
                        {
                            cs.map(c => (<SingleClipping clipping={c}/>))
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

