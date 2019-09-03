import {ClippingParser} from "./ClippingParser";

export const Japanese = new ClippingParser(
    "japanese",
    ["メモ", "ハイライト", "ブックマーク"],
    ["ページ", "位置"],
    /(\d\d?)日/,
    ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    /(\d\d\d\d)年/
);
export const English = new ClippingParser(
    "english",
    ["Note", "Highlight", "Bookmark"],
    ["page", "location"],
    /(\d\d?)/,
    ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",],
    /(\d\d\d\d)/,
);
export const Italian = new ClippingParser(
    "italian",
    ["nota", "segnalibro", "evidenziazione"],
    ["pagina", "posizione"],
    /(\d\d?)/,
    ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
    /(\d\d\d\d)/
);
export const Spanish = new ClippingParser(
    "spanish",
    ["nota", "marcador", "subrayado"],
    ["página", "posición"],
    /(\d\d?)/,
    ["enero", "febrer", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    /(\d\d\d\d)/
);
export const clippingParsers = [English, Japanese, Italian, Spanish];