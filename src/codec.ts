import { PrefixCodeTable } from "./trees"

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