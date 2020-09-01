const util = require('util')
import { exec } from 'promisify-child-process'
import { execSync } from 'child_process'
import dirTree from 'directory-tree'

// export const exec = util.promisify(exec_)

const DEFAULT_AUTHOR_REGEX = /\nauthor-mail <(.*)>/g

export function getFileOwners({ filePath, regex = DEFAULT_AUTHOR_REGEX }) {
    let stdout = execSync(`git blame -w --line-porcelain ${filePath}`)
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
    children?: Tree[]
}

export function bfs(tree: Tree) {
    const results = []
    var queue = [tree]
    var n: Tree

    while (queue.length > 0) {
        n = queue.shift()
        results.push(n)

        if (!n.children) {
            continue
        }

        for (var i = 0; i < n.children.length; i++) {
            queue.push(n.children[i])
        }
    }
    return results
}

export let average = (array) => array.reduce((a, b) => a + b, 0) / array.length
