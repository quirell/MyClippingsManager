export class LineReader {
    private linesNumber = 0;

    get readLinesNumber(): number {
        return this.linesNumber;
    }

    get hasNextLine(): boolean {
        return this.position + "\r\n".length < this.text.length
    }

    private position = -"\r\n".length;

    constructor(private text: string) {
    }

    nextLine = (): string => {
        this.linesNumber += 1;
        let previousPosition = this.position + "\r\n".length;
        this.position = this.text.indexOf("\r\n", previousPosition);
        return this.text.substring(previousPosition, this.position)
    }
}

