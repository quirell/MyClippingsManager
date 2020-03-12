import React from 'react';
import "react-table/react-table.css";
import Highlight, {RemoveHandler, RemoveNoteHandler} from "./Highlight";
import {Clipping} from "./clippings/Clipping";
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
import {ClippingsStore, Pagination, removeNoteById} from "./storage/IndexedDbClippingStore";
import _ from "lodash";


type LoadClippingsHandler = (pagination: Pagination) => Promise<void>;

interface Props {
    displayOptions: DisplayOptions;
    clippings: Clipping[];
    clippingsCount: number;
    removeClipping: RemoveHandler;
    removeNote: RemoveNoteHandler;
    loadClippings: LoadClippingsHandler;
}

export default function Display(props: Props) {
    const listRef: any = React.useRef(null);
    const scrollerRef = React.useRef(null);
    const cellMeasurerCache = React.useRef(new CellMeasurerCache({defaultHeight: 144.667, fixedWidth: true}));
    const [forceRerender, setForceRerender] = React.useState(true);

    React.useEffect(() => {
        cellMeasurerCache.current.clearAll();
        // This is only used to force rerender on specific properties change, because otherwise
        // clippings would be rendered in insufficient or abundant space
        setForceRerender(!forceRerender);
    }, [props.displayOptions, props.clippings]);

    const isRowLoaded = ({index} : Index) => {
        return !!props.clippings[index];
    };

    const rowCount = () => props.clippings.length;

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
                    <Highlight clipping={c}
                               displayOptions={props.displayOptions}
                               removeClipping={props.removeClipping}
                               removeNote={props.removeNote}
                    />
                </div>
            </CellMeasurer>
        )
    };

    return (
        <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={props.loadClippings}
            rowCount={props.clippingsCount}
            minimumBatchSize={50}
            >
            {({ onRowsRendered, registerChild }) => (
                <WindowScroller>
                    {({height, isScrolling, scrollTop, onChildScroll}) => (
                        /*<AutoSizer disableHeight>*/
                        // {({width}) => (
                                <List
                                    style={{outline: 0}}
                                    autoHeight
                                    deferredMeasurementCache={cellMeasurerCache.current}
                                    height={height}
                                    isScrolling={isScrolling}
                                    onScroll={onChildScroll}
                                    onRowsRendered={onRowsRendered}
                                    overscanRowCount={10}
                                    ref={registerChild}
                                    rowHeight={cellMeasurerCache.current.rowHeight}
                                    rowRenderer={renderRow}
                                    rowCount={rowCount()}
                                    estimatedRowSize={144.667}
                                    scrollTop={scrollTop}
                                    width={document.body.clientWidth}
                                />
                        // )}
                        // </AutoSizer>
                    )}
                </WindowScroller>)}
        </InfiniteLoader>);
}





