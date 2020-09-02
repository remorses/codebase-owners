import assert from 'assert'
import { makeTreeWithInfo, printTree, getGitIgnoreRegexes } from '../src/tree'
import { getFileOwners, bfs } from '../src/support'
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
it('getFileOwners', async () => {
    console.log(await getFileOwners({ filePath: './package.json' }))
})
it('makeTreeWithInfo', async () => {
    console.log(JSON.stringify(await makeTreeWithInfo('.'), null, 4))
})
it('makeTreeWithInfo and printTree', async () => {
    console.log(printTree(await makeTreeWithInfo('.')))
})
