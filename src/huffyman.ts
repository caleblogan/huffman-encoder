import fs from 'fs';
import { PrefixCodeTable, buildPrefixCodeTable, buildTree } from './trees';

function main() {
    const inFilename = process.argv[2];
    const outFilename = process.argv[3];
    if (!inFilename || !outFilename) {
        printUsage();
        process.exit(1);
    }
    try {
        const text = fs.readFileSync(inFilename, 'utf8');
        const frequencies = buildFrequencyMap(text)
        const tree = buildTree(frequencies)
        const codeTable = buildPrefixCodeTable(tree)

        writeCodeTable(codeTable, outFilename)
    } catch (error) {
        if (error instanceof Error && "code" in error) {
            console.error('Error reading/writing file:', error.message);
            process.exit(1);
        }
        throw error;
    }
}

function encode(text: string, codeTable: PrefixCodeTable) {
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

    // Get size
    // const read = fs.createReadStream(filename)
    // read.on('data', (chunk) => {
    //     const buff = Buffer.from(chunk)
    //     console.log(buff.readUint32LE())
    // })
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
