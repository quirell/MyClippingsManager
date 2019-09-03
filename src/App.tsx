import React, {ChangeEvent} from 'react';
import './App.css';
import Display from "./Display";
import {Clipping} from "./clippings/Clipping";
import {parseClippingsFile} from "./clippings/ClippingsFIleParser";
import {joinNoteWithHighlightByLocation} from "./clippings/HighlightNoteMatcher";
import Filter from "./Filter";
import {Button} from "@material-ui/core";

const App: React.FC = () => {
    const openFilePickerRef: any = React.useRef();
    const [clippings, setClippings] = React.useState<Clipping[]>([]);
    const fileAdded = async (ev: ChangeEvent<HTMLInputElement>) => {
        const files: (FileList | null) = ev.target.files;
        if (files == null || files.length === 0)
            return;
        console.time("parsing");
        const clippings = await parseClippingsFile(files[0]);
        console.timeEnd("parsing");
        console.time("joining");
        joinNoteWithHighlightByLocation(clippings);
        console.timeEnd("joining");
        setClippings(clippings);
    };
    return (
        <div className="App">
            <input type="file" onChange={fileAdded} ref={openFilePickerRef} hidden={true}/>
            <Button variant="contained" onClick={() => openFilePickerRef.current.click()}>
                Select MyClippings File
            </Button>
            <br/>
            <Filter/>
            <br/>
            <Display clippings={clippings}/>
        </div>
    );
}

export default App;
