import {Clipping} from "../clippings/Clipping";
import axios from "axios"

function firstValidUtf8ByteAfter(pos:number,buffer:Uint8Array){
    const utf8intermediateByteMask = 0b11000000;
    const utf8intermediateByteMarker = 0b10000000;
    while((buffer[pos] & utf8intermediateByteMask) === utf8intermediateByteMarker)
        pos++;
    return pos;
}

export function findHighlightPosition(highlight:Clipping,bookBinary:ArrayBuffer,locations:number){
    const SEARCH_RADIUS = 1000;

    const locationSize = bookBinary.byteLength / locations;
    const searchStart = highlight.location!.start*locationSize-SEARCH_RADIUS;
    const searchExcerptBinary = bookBinary.slice(searchStart,searchStart+SEARCH_RADIUS*3);
    let buffer = new Uint8Array(searchExcerptBinary);

    buffer = buffer.slice(firstValidUtf8ByteAfter(0,buffer),firstValidUtf8ByteAfter(buffer.length-5,buffer));
    const utfDecoder = new TextDecoder();
    const htmlSearchExcerpt = utfDecoder.decode(buffer);

    const whitespace_betweenRtTag_htmlTag = /(<rt>.*<\/rt>)|(<[^<]*>)|(\s+)/g;
    const searchExcerpt = htmlSearchExcerpt.replace(whitespace_betweenRtTag_htmlTag,"");

    const sanitizedContent = highlight.content.replace(/\s+/g,"");

    return searchExcerpt.search(sanitizedContent)
}

export async function getBookContent1(){
    const axiosResponse = await axios.get<ArrayBuffer>('test.html',{
        responseType:"arraybuffer"
    });
    return axiosResponse.data;
}

async function getBookContent(file:File){
    const formData  = new FormData();
    formData.append("file",file);
    const axiosResponse = await axios.post<string>('bookcontent', formData,{
        responseType: "arraybuffer"
    });
    return axiosResponse.data;
}