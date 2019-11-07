import React from 'react';
import "react-table/react-table.css";
import Highlight from "./Highlight";
import {Clipping} from "./clippings/Clipping";
import {AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer, WindowScroller} from "react-virtualized";

interface Props {
    clippings: Clipping[];
    showNotes: boolean;
    showSurroundingContent: boolean;
}

const test: Clipping = {
    "title": "こころ",
    "author": "夏目 漱石",
    "content": "郷里の関係からでない事は明らかであっ",
    "date": new Date(123123123),
    "type": 1,
    location: {start: 12, end: 123},
    page: {start: 1, end: 123},
    notes: [{content: "ASdASDASDASD", date: new Date()} as any],
    surrounding: {before: "asas sad asd as sad sad ", after: "adsa sa dsa asd sad ad s "}
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
        date: new Date(2321322323323)
    } as any,
        {
            content: "bbbbbbbbbbbbbbbbb\nbbbbbbbbbbb bbbfddddddddd dddddddddddddddddddddddfddf",
            date: new Date(12312312321)
        } as any,
        {content: "瞬く間に彼がなくなったなぜなら僕は晴れを殺したからだもしまだここにいるのなら僕の敵討ちするということです", date: new Date()} as any]
};


export default function Display(props: Props) {
    const listRef:any = React.useRef(null);
    const scrollerRef = React.useRef(null);
    const cellMeasurerCache = React.useRef(new CellMeasurerCache({defaultHeight: 144.667, fixedWidth: true}));
    if (listRef.current != null && props.clippings.length !== listRef.current.props.rowCount) {
        cellMeasurerCache.current.clearAll();
    }
    const renderRow: ListRowRenderer = ({index, key, parent, style}) => {
        const c = props.clippings[index];
        return (
            <CellMeasurer
                cache={cellMeasurerCache.current}
                columnIndex={0}
                key={key}
                rowIndex={index}
                parent={parent}
            >
                <div style={style} key={key}>
                    <Highlight clipping={c} showNotes={props.showNotes}
                               showSurroundingContent={props.showSurroundingContent}/>
                </div>
            </CellMeasurer>
        )
    };

    if (props.clippings.length > 0) {
        return <WindowScroller ref={scrollerRef}>
            {({height, isScrolling, scrollTop, onChildScroll}) => (
                <AutoSizer disableHeight>
                    {({width}) => (
                        <List
                            autoHeight
                            deferredMeasurementCache={cellMeasurerCache.current}
                            height={height}
                            isScrolling={isScrolling}
                            onScroll={onChildScroll}
                            overscanRowCount={5}
                            ref={listRef}
                            rowHeight={cellMeasurerCache.current.rowHeight}
                            rowRenderer={renderRow}
                            rowCount={props.clippings.length}
                            scrollTop={scrollTop}
                            width={width}
                        />
                    )}
                </AutoSizer>
            )}
        </WindowScroller>
    }
    return <div><Highlight clipping={test} showNotes showSurroundingContent/><Highlight clipping={longTest} showNotes/>
    </div>;
}





