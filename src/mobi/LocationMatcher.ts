import {Clipping} from "../clippings/Clipping";

function firstValidUtf8ByteAfter(pos:number,buffer:Uint8Array){
    const utf8intermediateByteMask = 0b11000000;
    const utf8intermediateByteMarker = 0b10000000;
    while((buffer[pos] & utf8intermediateByteMask) == utf8intermediateByteMarker)
        pos++;
    return pos;
}

function findHighlightPosition(highlight:Clipping,bookBinary:string,locations:number){
    const SEARCH_RADIUS = 1000;
    const locationSize = bookBinary.length/locations;
    const searchStart = highlight.location!.start*locationSize-SEARCH_RADIUS;
    const searchExcerptBinary = bookBinary.substring(searchStart,SEARCH_RADIUS*2);
    const utfDecoder = new TextDecoder();
    let buffer = new Uint8Array(searchExcerptBinary.split("") as any);
    buffer = buffer.slice(firstValidUtf8ByteAfter(0,buffer),firstValidUtf8ByteAfter(buffer.length-5,buffer));
    const htmlSearchExcerpt = utfDecoder.decode(buffer);
    const whitespace_betweenRtTag_htmlTag = /(<rt>.*<\/rt>)|(<[^<]*>)|(\s+)/g
    const searchExcerpt = htmlSearchExcerpt.replace(whitespace_betweenRtTag_htmlTag,"");
    const sanitizedContent = highlight.content.replace(/\s+/g,"");
    return searchExcerpt.search(sanitizedContent)
}
