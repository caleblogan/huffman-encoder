import assert from "node:assert"
import { describe, it } from "node:test"
import fs from "fs"
import { buildFrequencyMap } from "../src/huffyman"
import { LeafNode, buildPrefixCodeTable, buildTree } from "../src/trees"


describe("buildTree", () => {
    it('it handles two frequencies a:20, b:50', () => {
        const map = new Map([['a', 20], ['b', 50]])
        const tree = buildTree(map)
        assert.strictEqual(tree.weight, 70)
        assert.strictEqual(tree.type, 'internal')
        assert.strictEqual(tree.left.weight, 20)
        assert.strictEqual(tree.right.weight, 50)
    })

    it('handle medium size frequency map of CDEKLMUZ', () => {
        const map = new Map([['C', 32], ['D', 42], ['E', 120], ['K', 7], ['L', 42], ['M', 24], ['U', 37], ['Z', 2]])
        const tree = buildTree(map)
        assert.strictEqual(tree.weight, 306)
        assert.strictEqual(tree.type, "internal")
        assert.strictEqual(tree.left.weight, 120)
        assert.strictEqual(tree.left.type, "leaf")
        assert.strictEqual(tree.left.character, 'E')
    })
})

describe("buildPrefixCodeTable", () => {
    it('it handles a single leaf node', () => {
        const tree: LeafNode = { type: "leaf", weight: 20, character: 'a' }
        const table = buildPrefixCodeTable(tree)
        assert.deepStrictEqual(table, new Map([['a', '']]))
    })
    it('it handles two frequencies a:20, b:50', () => {
        const map = new Map([['a', 20], ['b', 50]])
        const tree = buildTree(map)
        const table = buildPrefixCodeTable(tree)
        assert.deepStrictEqual(table, new Map([['a', '0'], ['b', '1']]))
    })
    it('handle medium size frequency map of CDEKLMUZ', () => {
        const map = new Map([['C', 32], ['D', 42], ['E', 120], ['K', 7], ['L', 42], ['M', 24], ['U', 37], ['Z', 2]])
        const tree = buildTree(map)
        const table = buildPrefixCodeTable(tree)
        assert.deepStrictEqual(table, new Map([
            ['C', '1110'], ['D', '101'], ['E', '0'], ['K', '111101'], ['L', '110'], ['M', '11111'], ['U', '100'], ['Z', '111100']
        ]))
    })
})


function readLesMisText() {
    return fs.readFileSync('test/les-mis.txt', 'utf8');
}

