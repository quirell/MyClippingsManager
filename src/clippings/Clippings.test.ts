import {clippingParsers, English, Japanese,} from "./ClippingParsers";
import {Clipping, NavigationType, Type} from "./Clipping";
import {parseClippings, selectParser} from "./ClippingsFIleParser";
import {joinNoteWithHighlightByLocation, Marker} from "./HighlightNoteMatcher";

it('english is correct', () => {
    const english = "- Your Highlight at location 7-13 | Added on Monday, 14 May 2018 09:50:49";
    const language = selectParser(english, clippingParsers);
    expect(language).toBe(English);
});
it('japanese is correct', () => {
    const japanese = "- 15ページ|位置No. 199-200のハイライト |作成日: 2018年5月14日月曜日 22:46:52";
    const language = selectParser(japanese, clippingParsers);
    expect(language).toBe(Japanese);
});

// it('selected language is correct', () => {
//     const line:string[] = ["NHK ニュース・読み物・2018-04-02",
//         "- Your Highlight at location 7-13 | Added on Monday, 14 May 2018 09:50:49",
//         "",
//         "日本のプロ野球でピッチャーとバッターの両方で活躍していた大谷翔平選手",
//         "=========="];
//     var clippings:Clipping[] = parseClippings(line);
//     console.log(clippings);
// });
//
// it('selected language is correct jp', () => {
//     const line:string[] =["こころ (夏目 漱石)",
//     "- 15ページ|位置No. 199-200のハイライト |作成日: 2018年5月14日月曜日 22:47:26",
//     "",
//     "その時分の私は先生とよほど懇意になった"];
//     var clippings:Clipping[] = parseClippings(line);
//     console.log(clippings);
// });

it('join note with highlight', () => {
    const clipping = (start: number, end: number, content: number, type: Type): Clipping =>
        ({
            type: type,
            author: "author",
            title: "title",
            date: new Date(),
            content: `${type === Type.highlight ? "highlight" : "note"} ${content}`,
            location: {start: start, end: end, type: NavigationType.location}
        });
    const highlight = (start: number, end: number, content: number) => clipping(start, end, content, Type.highlight);
    const note = (start: number, end: number, content: number) => clipping(start, end, content, Type.note);
    const clippings: Clipping[] = [
        highlight(1, 10, 1),
        highlight(1, 10, 2),
        note(5, 7, 1),
        note(10, 12, 2),
        note(12, 14, 3)
    ];
    let result: { [x: string]: Marker[] } = joinNoteWithHighlightByLocation(clippings);
    console.log(result);
});
