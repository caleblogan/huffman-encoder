import assert from "node:assert"
import { describe, it } from "node:test"
import fs from "fs"
import { buildFrequencyMap } from "../src/huffyman"
import { LeafNode, buildPrefixCodeTable, buildTree } from "../src/trees"
import { pack } from "../src/codec"


describe("pack", () => {
    it('can pack 001 and 101 codes', () => {
        const packed = pack('001101')
        assert.strictEqual(packed.length, 1)
        assert.strictEqual(packed[0], 32 + 16 + 4)
        assert.strictEqual(packed[0].toString(2).padStart(8, "0"), "00110100")
    })
    it('can pack multiple bytes and add padding to end', () => {
        const packed = pack('1111111111000000')
        assert.strictEqual(packed.length, 2)
        assert.strictEqual(packed[0], 255)
        assert.strictEqual(packed[1], 128 + 64)
        assert.strictEqual(packed[1].toString(2).padStart(8, "0"), "11000000")
    })
})
