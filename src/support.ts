const util = require('util')
import { exec } from 'promisify-child-process'
import { execSync } from 'child_process'
import dirTree from 'directory-tree'
import chalk from 'chalk'

// export const exec = util.promisify(exec_)

const DEFAULT_AUTHOR_REGEX = /\nauthor-mail <(.*)>/g

// TODO filter by only one author email, see only that author percentages
export async function getFileOwners({
    filePath,
    regex = DEFAULT_AUTHOR_REGEX,
}) {
    try {
        let { stdout } = await exec(`git blame -w --line-porcelain ${filePath}`)
        const data = stdout.toString()

        let match
        let results = []
        while ((match = regex.exec(data.toString())) !== null) {
            const authorEmail = match[1] || ''
            if (authorEmail && authorEmail !== 'not.committed.yet') {
                results.push(authorEmail)
            }
            // expected output: "Found foo. Next starts at 9."
            // expected output: "Found foo. Next starts at 19."
        }
        return results
    } catch {
        return []
    }
}

export function arrayMax<T>(arr: T[], getter: (x: T) => number) {
    return arr.reduce(function (p, v) {
        return getter(p) > getter(v) ? p : v
    })
}

export function makeHist(data: string[]) {
    const hist = {}
    data.forEach((x) => {
        if (hist[x]) {
            hist[x]++
        } else {
            hist[x] = 1
        }
    })
    return hist
}

export type Tree = {
    depth?: number
    children?: Tree[]
}

export function bfs(tree: Tree) {
    const results = []
    tree.depth = 0
    var queue = [tree]
    var n: Tree

    while (queue.length > 0) {
        n = queue.shift()
        results.push(n)

        if (!n.children) {
            continue
        }
        for (var i = 0; i < n.children.length; i++) {
            const child = n.children[i]
            child.depth = (n.depth || 0) + 1
            queue.push(child)
        }
    }
    return results
}

export let average = (array) => {
    return array.reduce(sum, 0) / array.length
}

export let weightedAverage = (array, weights) => {
    if (weights.length !== array.length) {
        throw new Error(
            'weightedAverage got weights with different length from array',
        )
    }
    const weightSum = weights.reduce((a, b) => a + b, 0)
    const normalizedWeights = weights.map((x) => x / weightSum)
    // console.log({ normalizedWeights })
    const weightedArray = array.map((x, i) => x * normalizedWeights[i])
    return (
        weightedArray.reduce((a, b) => a + b, 0) /
        normalizedWeights.reduce((a, b) => a + b, 0)
    )
}

export function alignRight(
    str: string,
    toAdd: string,
    length = 100,
    maxSpace = 48,
) {
    if (toAdd.length > maxSpace) {
        toAdd = toAdd.slice(0, maxSpace - 3) + '...'
    } else {
        toAdd =
            toAdd +
            Array(maxSpace - toAdd.length)
                .fill(' ')
                .join('')
    }

    let paddingLength = length - str.length - maxSpace
    paddingLength = paddingLength < 0 ? 0 : paddingLength
    return Array(paddingLength).fill(' ').join('') + toAdd
}

export function numInRange(x, range: [number, number], includeMax = true) {
    var max = range[1],
        min = range[0],
        d = max - min
    return x === max && includeMax ? x : ((x - min) % d) + min
}

export function sum(a, b) {
    return a + b
}

export function meaningfulColor(x: number) {
    if (x < 100) {
        return chalk.gray(x)
    } else if (x < 400) {
        return chalk.greenBright(x)
    } else if (x < 1000) {
        return chalk.yellow(x)
    } else if (x < 5000) {
        return chalk.redBright(x)
    } else {
        return chalk.red(x)
    }
}
