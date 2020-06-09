import {Clipping, Type} from "./Clipping";

type PartialClipping = Pick<Clipping, "location" | "title" | "content" | "id" | "type">;

/**
 * Stateful component that tells if consecutive clippings are similar
 */
class _SimilarityClassifier {

    private prev: PartialClipping = {id: "", title: "", content: "", type: Type.highlight};
    private prevGroup = false;

    private cache = new Map<string, boolean>()

    getGroup(clipping: PartialClipping): boolean {
        const group = this.cache.get(clipping.id);
        if (group !== undefined)
            return group;
        if (clipping.type !== Type.highlight)
            this.prevGroup = !this.prevGroup;
        else
            this.prevGroup = this.prevGroup === this.overlapByLocationAndContent(this.prev, clipping);
        this.cache.set(clipping.id, this.prevGroup);
        this.prev = clipping;
        return this.prevGroup;
    }

    clearCache() {
        this.prev = {id: "", title: "", content: "", type: Type.highlight};
        this.prevGroup = false;
        this.cache.clear();
    }

    /**
     * Returns true if both clippings have overlapping content and location
     */
    private overlapByLocationAndContent(c1: PartialClipping, c2: PartialClipping): boolean {
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
            [prev, cur] = [cur, prev];
        }
        return max;
    }
}

export const SimilarityClassifier = new _SimilarityClassifier();