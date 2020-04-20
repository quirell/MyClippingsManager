import {Clipping, Type} from "./Clipping";

/**
 * Stateful component that tells if consecutive clippings are similar
 */
class _SimilarityClassifier {

    private previous: Clipping = {
        addedOn: new Date(),
        content: "",
        date: new Date(),
        id: "1",
        title: "",
        type: Type.highlight
    }
    private previousGroup = false;

    /**
     * Returns the same value as for last call if the clippings are similar or opposite value if not
     */
    group(clipping: Clipping): boolean {
        const overlap = _SimilarityClassifier.overlapByLocationAndContent(this.previous, clipping);
        this.previous = clipping;
        if (!overlap)
            this.previousGroup = !this.previousGroup;
        return this.previousGroup;
    }

    /**
     * Returns true if both clippings have overlapping content and location
     */
    static overlapByLocationAndContent(c1: Clipping, c2: Clipping): boolean {
        if (!c1.location || !c2.location)
            return false;
        if (c1.title !== c2.title)
            return false;
        if (c1.location.end < c2.location.start || c2.location.end < c1.location.start)
            return false; // locations don't overlap
        const lcs = _SimilarityClassifier.longestCommonSubstring(c1.content, c2.content);
        return lcs / Math.max(c1.content.length, c2.content.length) > 0.4;
    }

    static longestCommonSubstring(c1: string, c2: string): number {
        let prev = new Array(Math.max(c1.length, c2.length)).fill(0);
        let cur = new Array(prev.length).fill(0);

        let max = 0;
        for (let i = 0; i < c1.length; i++) {
            for (let j = 0; j < c2.length; j++) {
                if (i === 0 || j === 0)
                    cur[j] = 0;
                else if (c1[i - 1] === c2[j - 1]) {
                    cur[j] = prev[j - 1] + 1
                    max = Math.max(max, cur[j]);
                } else {
                    cur[j] = 0;
                }
            }
            const temp = prev;
            prev = cur;
            cur = temp;
        }
        return max;
    }
}

export const SimilarityClassifier = new _SimilarityClassifier();