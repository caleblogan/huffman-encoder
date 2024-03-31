export type Node = InternalNode | LeafNode;

export type InternalNode = {
    type: "internal",
    weight: number
    left: Node
    right: Node
}

export type LeafNode = {
    type: "leaf"
    weight: number
    character: string
}

export function buildTree(frequencies: Map<string, number>): Node {
    const pq = new PriorityQueue()
    for (const [char, freq] of frequencies) {
        pq.add({ type: "leaf", weight: freq, character: char })
    }

    while (pq.length > 1) {
        const left = pq.pop()
        const right = pq.pop()
        const node: InternalNode = { type: "internal", weight: left.weight + right.weight, left, right }
        pq.add(node)
    }

    return pq.pop()
}

/**  Binary string of 0 or more 1's and 0's. Example: "001" */
export type Code = string
export type PrefixCodeTable = Map<string, Code>
export type ReversePrefixCodeTable = Map<Code, string>

// TODO: Replace recursive function with iterative function for better performance
export function buildPrefixCodeTable(root: Node): PrefixCodeTable {
    const map = new Map()
    buildPrefixCodeTableRec(root, "", map)
    return map
}

function buildPrefixCodeTableRec(node: Node, path: Code, map: PrefixCodeTable) {
    if (node.type === 'leaf') {
        map.set(node.character, path)
        return
    } // path + '0' or path + '1'
    buildPrefixCodeTableRec(node.left, path + '0', map)
    buildPrefixCodeTableRec(node.right, path + '1', map)
}


// TODO: Should use heap for better performance
class PriorityQueue {
    private queue: Node[] = []

    add(node: Node) {
        this.queue.push(node)
        this.queue.sort((a, b) => a.weight - b.weight)
    }

    pop(): Node {
        return this.queue.shift()!
    }

    get length() {
        return this.queue.length
    }
}