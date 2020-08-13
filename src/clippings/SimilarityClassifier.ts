import {Clipping, Type} from "./Clipping";

type PartialClipping = Pick<Clipping, "location" | "title" | "content" | "id" | "type">;

/**
 * Stateful component that tells if consecutive clippings are similar
 */
class _SimilarityClassifier {

    private prev: PartialClipping = {id: "", title: "", content: "", type: Type.highlight};
    private prevGroup = false;
    // This is a hack - clearChace is called in Display.tsx after the clipping was deleted, but we don't want to do
    // anything  in such case, because the cache was cleared in the remove clipping function already
    // I was too lazy to refactor
    private partialClearMarker = false;

    private cache: boolean[] = [];

    getGroup(index:number,clipping: PartialClipping): boolean {
        const group = this.cache[index];
        if (group !== undefined)
            return group;
        if (clipping.type !== Type.highlight)
            this.prevGroup = !this.prevGroup;
        else
            this.prevGroup = this.prevGroup === this.overlapByLocationAndContent(this.prev, clipping);
        this.cache[index] = this.prevGroup
        this.prev = clipping;
        return this.prevGroup;
    }

    clearCache(before?:{clipping:Clipping,index:number}) {
        if(this.partialClearMarker){
            this.partialClearMarker = false;
            return;
        }

        if(!before){
            this.prev = {id: "", title: "", content: "", type: Type.highlight};
            this.prevGroup = false;
            this.cache = [];
        }else{
            this.prevGroup = this.cache[before.index];
            this.cache = this.cache.slice(0,before.index+1);
            this.prev = before.clipping;
            this.partialClearMarker = true;
        }
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