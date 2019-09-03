export function matchOrError(target: string, regExp: RegExp, error: string): RegExpMatchArray {
    const matchArray = target.match(regExp);
    if (!matchArray) throw new Error(error);
    return matchArray;
}

export function findIndexOrError<T>(target: Array<T>, predicate: (x: T) => boolean, error: string) {
    const index = target.findIndex(predicate);
    if (index < 0) throw new Error(error);
    return index;
}