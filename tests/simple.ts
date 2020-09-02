import assert from 'assert'
import {
    makeTreeWithInfo,
    printTree,
    getGitIgnoreRegexes,
    getFileOwners,
    bfs,
    weightedAverage,
} from '../src/'

import directoryTree from 'directory-tree'

it('directoryTree exclude works', () => {
    const tree = directoryTree('.', { exclude: [/^tests$/, /node_modules/] })
    const nodes = bfs(tree)
    assert(
        !nodes.find((x) => {
            // console.log(x.name)
            return x.name === 'tests'
        }),
    )
    console.log()
})
// it('tree with options.addToLine', () => {
//     console.log(
//         makeTree('.', {
//             exclude: [/node_modules/],
//             addToLine: ({ filePath }) => {
//                 return ` repeated ${filePath}`
//             },
//         }),
//     )
// })

it('getGitIgnoreRegexes', async () => {
    console.log(await getGitIgnoreRegexes())
})
it('weightedAverage', async () => {
    const x = [2, 0]
    const w = [5, 5]
    const res = weightedAverage(x, w)
    console.log(res)
})
it('getFileOwners', async () => {
    console.log(await getFileOwners({ filePath: './package.json' }))
})
it('makeTreeWithInfo', async () => {
    console.log(JSON.stringify(await makeTreeWithInfo('.'), null, 4))
})
it('makeTreeWithInfo and printTree', async () => {
    console.log(printTree(await makeTreeWithInfo('.')))
})
