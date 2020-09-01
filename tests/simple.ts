import assert from 'assert'
import { makeTree } from '../src/tree'

it('tree', () => {
    console.log(makeTree('.', { exclude: [/node_modules/] }))
})
