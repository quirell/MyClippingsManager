export interface DisplayOptions {
    surrounding: {
        show: boolean,
        sentencesNumber: number
    }
    showNotesWithHighlightsTogether: boolean;
}

export const defaultDisplayOptions: DisplayOptions = {
    surrounding: {
        show: false,
        sentencesNumber: 1
    },
    showNotesWithHighlightsTogether: false
};

