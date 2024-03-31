import { PrefixCodeTable, ReversePrefixCodeTable } from "./trees"

export function encode(text: string, codeTable: PrefixCodeTable): Buffer {
    const codes = []
    for (const char of text) {
        const code = codeTable.get(char)
        if (code === undefined) {
            throw new Error(`Character ${char} not found in code table`)
        }
        codes.push(code)
    }
    return pack(codes.join(''))
}

/**
 * Buffer is padded with 0's on the right to make it a multiple of 8 
 */
export function pack(codes: string): Buffer {
    const buffer = Buffer.alloc(Math.ceil(codes.length / 8))
    for (let i = 0; i < codes.length; i += 8) {
        buffer.writeUInt8(parseInt(codes.slice(i, i + 8).padEnd(8, '0'), 2), i / 8)
    }
    return buffer
}

export function decode(encodedText: Buffer, prefixTable: ReversePrefixCodeTable, originalSize: number): string {
    const result: string[] = []

    const bitString = unpack(encodedText, originalSize)
    let charBuffer = ""
    for (const bit of bitString) {
        charBuffer += bit
        if (prefixTable.has(charBuffer)) {
            result.push(prefixTable.get(charBuffer)!)
            charBuffer = ""
        }
        if (result.length === originalSize) {
            break
        }
    }

    return result.join("")
}

function unpack(buffer: Buffer, size: number): string {
    const bits: string[] = []
    for (let byte of buffer) {
        bits.push(byte.toString(2).padStart(8, '0'))
    }
    return bits.join("")
}