import fs, { read } from 'fs';
import { PrefixCodeTable, buildPrefixCodeTable, buildTree } from './trees';
import { decode, encode } from './codec';

function main() {
    const option: 'e' | 'd' = process.argv[2].replace('-', '') as 'e' | 'd';
    if (!['e', 'd'].includes(option)) {
        throw new Error('Invalid option. Must be "-e" or "-d"')
    }
    const inFilename = process.argv[3];
    const outFilename = process.argv[4];
    if (!inFilename || !outFilename) {
        printUsage();
        process.exit(1);
    }
    if (option === 'e') {
        try {
            const text = fs.readFileSync(inFilename, 'utf8');
            const frequencies = buildFrequencyMap(text)
            const tree = buildTree(frequencies)
            const codeTable = buildPrefixCodeTable(tree)
            writeHeader(codeTable, outFilename)
            writeEncodedText(encode(text, codeTable), text.length, outFilename)
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                console.error('Error reading/writing file:', error.message);
                process.exit(1);
            }
            throw error;
        }
    } else {
        const { table, textOffset } = readHeader(inFilename)
        const reverseTable = new Map([...table.entries()].map(([k, v]) => [v, k]))
        const { encodedText, originalSize } = readEncodedText(inFilename, textOffset)
        const text = decode(encodedText, reverseTable, originalSize)
        writeDecodedText(text, outFilename)
    }
}



// Header:
// 4 bytes: size of the code table
// N-Bytes: JSON string of the code table
// N-Bytes: Encoded text starting after size of code table
function writeHeader(codeTable: PrefixCodeTable, filename: string) {
    const fh = fs.createWriteStream(filename)
    const codeBuffer = Buffer.from(JSON.stringify([...codeTable.entries()]))
    const size = Buffer.alloc(4)
    console.log("Header Size", codeBuffer.length + 4)
    size.writeUInt32LE(codeBuffer.length + 4)
    fh.write(size)
    fh.write(codeBuffer)
}

function readHeader(filename: string): { table: PrefixCodeTable, textOffset: number } {
    const fh = fs.openSync(filename, 'r')
    const sizeBuffer = Buffer.alloc(4)
    fs.readSync(fh, sizeBuffer, 0, 4, 0)
    const codeBuffer = Buffer.alloc(sizeBuffer.readUInt32LE() - 4)
    fs.readSync(fh, codeBuffer, 0, codeBuffer.length, 4)
    // console.log(JSON.parse(codeBuffer.toString()))
    return { table: new Map(JSON.parse(codeBuffer.toString())), textOffset: sizeBuffer.readUInt32LE() }
}

/**
 * 4 bytes: size of the original text (number of characters in original text)
 * N bytes: encoded text 
 */
function writeEncodedText(encodedText: Buffer, originalSize: number, filename: string) {
    const fh = fs.createWriteStream(filename, { flags: 'a' })
    const sizeBuffer = Buffer.alloc(4)
    sizeBuffer.writeUInt32LE(originalSize)
    fh.write(sizeBuffer)
    fh.write(encodedText)
}
function writeDecodedText(text: string, filename: string) {
    const fh = fs.createWriteStream(filename, { flags: 'w' })
    fh.write(text)
}

function readEncodedText(filename: string, textOffset: number): { encodedText: Buffer, originalSize: number } {
    const fh = fs.openSync(filename, 'r')
    const sizeBuffer = Buffer.alloc(4)
    fs.readSync(fh, sizeBuffer, 0, 4, textOffset)
    const encodedText = Buffer.alloc(sizeBuffer.readUInt32LE())
    fs.readSync(fh, encodedText, 0, encodedText.length, textOffset + 4)
    return { encodedText, originalSize: sizeBuffer.readUInt32LE() }
}

if (__filename === process.argv[1]) {
    main();
}

function printUsage() {
    console.log('Usage: node huffman.js in-file out-file');
}

export function buildFrequencyMap(text: string) {
    const freqs = new Map<string, number>()
    for (const char of text) {
        freqs.set(char, (freqs.get(char) ?? 0) + 1)
    }
    return freqs
}
