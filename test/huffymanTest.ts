import assert from "node:assert"
import { describe, it } from "node:test"
import fs from "fs"
import { buildFrequencyMap } from "../src/huffyman"


describe("buidlFrequencyMap", () => {
    it('it should handle les mis "t" and "X"', () => {
        const text = readLesMisText()
        const frequencies = buildFrequencyMap(text)
        assert.strictEqual(frequencies.get('t'), 223000)
        assert.strictEqual(frequencies.get('X'), 333)
    })
})


function readLesMisText() {
    return fs.readFileSync('test/les-mis.txt', 'utf8');
}

