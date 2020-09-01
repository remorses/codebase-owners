import assert from 'assert'
import { makeTree, makeTreeWithInfo } from '../src/tree'
import { getFileOwners } from '../src/support'

it('tree', () => {
    console.log(makeTree('.', { exclude: [/node_modules/] }))
})
it('tree with options.addToLine', () => {
    console.log(
        makeTree('.', {
            exclude: [/node_modules/],
            addToLine: ({ filePath }) => {
                return ` repeated ${filePath}`
            },
        }),
    )
})
it('getFileOwners', async () => {
    console.log(await getFileOwners({ filePath: './package.json' }))
})
it('makeTreeWithInfo', async () => {
    console.log(await makeTreeWithInfo('.'))
})
