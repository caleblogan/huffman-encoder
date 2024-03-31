import fs from 'fs';
import { PrefixCodeTable, buildPrefixCodeTable, buildTree } from './trees';
import { encode } from './codec';

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
            writeCodeTable(codeTable, outFilename)
            writeEncodedText(encode(text, codeTable), text.length, outFilename)
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                console.error('Error reading/writing file:', error.message);
                process.exit(1);
            }
            throw error;
        }
    } else {
        console.log('Decoding not implemented yet');
    }
}



// Header:
// 4 bytes: size of the code table
// N-Bytes: JSON string of the code table
// N-Bytes: Encoded text starting after size of code table
function writeCodeTable(codeTable: PrefixCodeTable, filename: string) {
    const fh = fs.createWriteStream(filename)
    const codeBuffer = Buffer.from(JSON.stringify([...codeTable.entries()]))
    const size = Buffer.alloc(4)
    size.writeUInt32LE(codeBuffer.length)
    fh.write(size)
    fh.write(codeBuffer)
}

function writeEncodedText(encodedText: Buffer, originalSize: number, filename: string) {
    const fh = fs.createWriteStream(filename, { flags: 'a' })
    const sizeBuffer = Buffer.alloc(4)
    sizeBuffer.writeUInt32LE(originalSize)
    fh.write(sizeBuffer)
    fh.write(encodedText)
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
