import fs from 'fs';

function main() {
    const filename = process.argv[2];
    console.log(process.argv)
    if (!filename) {
        printUsage();
        process.exit(1);
    }
    try {
        const text = fs.readFileSync(filename, 'utf8');
        const frequencies = buildFrequencyMap(text)
        console.log(frequencies.get('X'))
    } catch (error) {
        if (error instanceof Error && "code" in error) {
            console.error('Error reading file:', error.message);
            process.exit(1);
        }
        throw error;
    }
}

if (__filename === process.argv[1]) {
    main();
}

function printUsage() {
    console.log('Usage: node huffman.js filename');
}

export function buildFrequencyMap(text: string) {
    const freqs = new Map<string, number>()
    for (const char of text) {
        freqs.set(char, (freqs.get(char) ?? 0) + 1)
    }
    return freqs
}
