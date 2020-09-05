import assert from 'assert'
import {
    makeTreeWithInfo,
    printTree,
    getGitIgnoreRegexes,
    getFileOwners,
    bfs,
    weightedAverage,
    gitDirectoryTree,
} from '../src/'

it('directoryTree and bfs', async () => {
    const tree = await gitDirectoryTree('.', {
        exclude: [/^tests$/, /node_modules/],
    })
    const nodes = bfs(tree)
    console.log(JSON.stringify(tree, null, 4))
    // assert(
    //     !nodes.find((x) => {
    //         // console.log(x.name)
    //         return x.name === 'tests'
    //     }),
    // )

    // console.log(nodes)
})

it('getGitIgnoreRegexes', async () => {
    const res = await getGitIgnoreRegexes()
    assert(res)
    console.log(res)
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
