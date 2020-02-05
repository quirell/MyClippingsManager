import React from "react";

interface RenderBodyProps {
    content: string
}
export function RenderBody(props: RenderBodyProps){
    return (
        <html>
        <head>
            <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
            <title> </title>
        </head>
        <body dangerouslySetInnerHTML={{__html : props.content}}/>
        </html>
    )
}