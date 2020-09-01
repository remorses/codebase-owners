import assert from 'assert'
import { makeTree } from '../src/tree'
import { getFileOwners } from '../src/support'

it('tree', () => {
    console.log(makeTree('.', { exclude: [/node_modules/] }))
})
it('getFileOwners', async () => {
    console.log(await getFileOwners({ filePath: './package.json' }))
})
