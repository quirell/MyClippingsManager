import React from 'react';
import "react-table/react-table.css";
import Highlight from "./Highlight";
import {Clipping} from "./clippings/Clipping";
import {List} from '@material-ui/core';

interface Props {
    clippings: Clipping[];
}

export default function Display(props: Props) {
    const test: Clipping = {
        "title": "こころ",
        "author": "夏目 漱石",
        "content": "郷里の関係からでない事は明らかであっ",
        "date": new Date(),
        "type": 1,
        location: {start: 12, end: 123},
        page: {start: 1, end: 123},
        notes: [{content: "ASdASDASDASD", date: new Date()} as any]
    };
    const longTest: Clipping = {
        "title": "I am fffffff long text I am ffffff long text I am ffffffffff long text",
        "author": "夏目 漱石",
        "content": "郷里の関係からでない事は明らかであっ ffff ffff ffff ffff fffff \nffffffffff multiline long content haha",
        "date": new Date(),
        "type": 1,
        location: {start: 12, end: 123},
        page: {start: 1, end: 123},
        notes: [{
            content: "ASdASDASDASD aaaaaaaaaaaaa aaaaaaaaaaaa aaaaaa\nsaaaaaaaaaaaaaaaaaa",
            date: new Date()
        } as any,
            {
                content: "bbbbbbbbbbbbbbbbb\nbbbbbbbbbbb bbbfddddddddd dddddddddddddddddddddddfddf",
                date: new Date()
            } as any,
            {content: "瞬く間に彼がなくなったなぜなら僕は晴れを殺したからだもしまだここにいるのなら僕の敵討ちするということです", date: new Date()} as any]
    };
    if (props.clippings.length > 0) {
        return <List>
            {props.clippings.map(c => <Highlight key={c.date.getTime() + c.type} clipping={c} showNotes/>)}
        </List>
    }

    return <div><Highlight clipping={test} showNotes/><Highlight clipping={longTest} showNotes/></div>;
}





