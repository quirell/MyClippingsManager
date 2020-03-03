import React from 'react';
import "react-table/react-table.css";
import Highlight from "./Highlight";
import {Clipping, Note} from "./clippings/Clipping";
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    List,
    ListRowRenderer,
    WindowScroller,
    InfiniteLoader,
    Index, IndexRange
} from "react-virtualized";
import {DisplayOptions} from "./header/DisplayOptions";
import {Filters} from "./filters/filterClippings";
import {ClippingsStore} from "./storage/IndexedDbClippingStore";
import _ from "lodash";

interface Props {
    filters: Filters
    displayOptions: DisplayOptions;
}

const test: Clipping = {
    id: "23",
    "title": "こころ",
    "author": "夏目 漱石",
    "content": "郷里の関係からでない事は明らかであっ",
    "date": new Date(123123123),
    "type": 1,
    location: {start: 12, end: 123},
    page: {start: 1, end: 123},
    notes: [{id: "1234",content: "ASdASDASDASD", date: new Date()} as any],
    // @ts-ignore
    surrounding: [null, {before: "asas sad asd as sad sad ", after: "adsa sa dsa asd sad ad s "}]
};
const longTest: Clipping = {
    addedOn: new Date(),
    id: "12",
    "title": "I am fffffff long text I am ffffff long text I am ffffffffff long text",
    "author": "夏目 漱石",
    "content": "郷里の関係からでない事は明らかであっ ffff ffff ffff ffff fffff \nffffffffff multiline long content haha",
    "date": new Date(),
    "type": 1,
    location: {start: 12, end: 123},
    page: {start: 1, end: 123},
    notes: [{
        id: "123",
        content: "ASdASDASDASD aaaaaaaaaaaaa aaaaaaaaaaaa aaaaaa\nsaaaaaaaaaaaaaaaaaa",
        date: new Date(2321322323323)
    } as any,
        {
            id: "1234",
            content: "bbbbbbbbbbbbbbbbb\nbbbbbbbbbbb bbbfddddddddd dddddddddddddddddddddddfddf",
            date: new Date(12312312321)
        } as any,
        {content: "瞬く間に彼がなくなったなぜなら僕は晴れを殺したからだもしまだここにいるのなら僕の敵討ちするということです", date: new Date()} as any]
};


export default function Display(props: Props) {
    const listRef: any = React.useRef(null);
    const scrollerRef = React.useRef(null);
    const cellMeasurerCache = React.useRef(new CellMeasurerCache({defaultHeight: 144.667, fixedWidth: true}));
    const [forceRerender, setForceRerender] = React.useState(true);
    const [clippings,setClippings] = React.useState<Clipping[]>([]);
    const [clippingsCount, setClippingsCount] = React.useState<number>(0);
    React.useEffect(() => {
        ClippingsStore
            .countClippings(props.filters)
            .then(setClippingsCount)
            .then(() => ClippingsStore.getClippings(props.filters,{startIndex:0,stopIndex:30}))
            .then((clippings) => {
                setClippings(clippings);
                cellMeasurerCache.current.clearAll();
                setForceRerender(!forceRerender);
            });
    },[props.filters]);

    React.useEffect(() => {
        cellMeasurerCache.current.clearAll();
        // This is only used to force rerender on specific properties change, because otherwise
        // clippings would be rendered in insufficient or abundant space
        setForceRerender(!forceRerender);
    }, [props.displayOptions]);

    const isRowLoaded = ({index} : Index) => {
        return !!clippings[index];
    };

    const rowCount = () => clippings.length;

    const loadMoreRows = async (indexRange:IndexRange) : Promise<void> => {
        const nextBatch = await ClippingsStore.getClippings(props.filters,indexRange);
        setClippings([...clippings,...nextBatch]);
    };

    const removeNote = async (clipping: Clipping, note: Note) => {
        clipping.notes = _.without(clipping.notes,note);
        await ClippingsStore.updateClipping(clipping);
        setClippings(clippings.map(c => c === clipping? {...clipping} : c));
    };

    const removeClipping = async(clipping: Clipping) => {
        await ClippingsStore.deleteClipping(clipping.id);
        setClippingsCount(clippingsCount-1);
        setClippings(_.without(clippings,clipping));
    };

    const renderRow: ListRowRenderer = ({index, key, parent, style}) => {
        const c = clippings[index];
        return (
            <CellMeasurer
                cache={cellMeasurerCache.current}
                columnIndex={0}
                key={key}
                rowIndex={index}
                parent={parent}
            >
                <div style={style} key={key}>
                    <Highlight clipping={c}
                               displayOptions={props.displayOptions}
                               removeClipping={removeClipping}
                               removeNote={removeNote}
                    />
                </div>
            </CellMeasurer>
        )
    };

    return (
        <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={loadMoreRows}
            rowCount={clippingsCount}
            minimumBatchSize={30}
            >
            {({ onRowsRendered, registerChild }) => (
                <WindowScroller ref={scrollerRef}>
                    {({height, isScrolling, scrollTop, onChildScroll}) => (
                        <AutoSizer disableHeight>
                            {({width}) => (
                                <List
                                    style={{outline: 0}}
                                    autoHeight
                                    deferredMeasurementCache={cellMeasurerCache.current}
                                    height={height}
                                    isScrolling={isScrolling}
                                    onScroll={onChildScroll}
                                    onRowsRendered={onRowsRendered}
                                    overscanRowCount={5}
                                    ref={registerChild}
                                    rowHeight={cellMeasurerCache.current.rowHeight}
                                    rowRenderer={renderRow}
                                    rowCount={rowCount()}
                                    scrollTop={scrollTop}
                                    width={width}
                                />
                            )}
                        </AutoSizer>
                    )}
                </WindowScroller>)}
        </InfiniteLoader>);
    return <div>
        {/*<Highlight clipping={test} displayOptions={{*/}
        {/*    showNotesWithHighlightsTogether: true,*/}
        {/*    surrounding: {show: true, sentencesNumber: 1}*/}
        {/*}} removeClipping={() => {}} removeNote={() => {}}/>*/}
        {/*<Highlight clipping={longTest} displayOptions={{*/}
        {/*    showNotesWithHighlightsTogether: true,*/}
        {/*    surrounding: {show: false, sentencesNumber: 1}*/}
        {/*}} removeClipping={() => {}} removeNote={() => {}}/>*/}
    </div>;
}





