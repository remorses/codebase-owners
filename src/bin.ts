#!/usr/bin/env node
import yargs from 'yargs'
import { printTree, makeTreeWithInfo } from './'

const argv = yargs
    .option('cwd', { type: 'string', default: process.cwd() })
    .option('exclude', { type: 'string', array: true, alias: 'e' })
    .option('alignLeft', { type: 'boolean' })
    .option('maxDepth', { type: 'number', default: 4, alias: 'd' })
    .option('printOnlyOwner', { type: 'boolean' })
    .option('verbose', { alias: 'v', type: 'boolean' })
    .help('help')
    .help('h').argv

async function main() {
    const tree = await makeTreeWithInfo(argv.cwd, {
        silent: argv.printOnlyOwner,
        exclude: argv.exclude,
    })
    if (argv.printOnlyOwner) {
        return console.log(tree.topContributorDetails.author)
    }
    console.log(
        printTree(tree, {
            maxDepth: argv.maxDepth,
            alignRight: !argv.alignLeft,
        }),
    )
}

main().catch((e) => console.error(argv.verbose ? e : e.message))
