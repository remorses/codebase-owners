#!/usr/bin/env node
import yargs from 'yargs'
import { printTree, makeTreeWithInfo } from './'

const argv = yargs
    .option('cwd', { type: 'string', default: process.cwd() })
    .option('cwd', { type: 'string', default: process.cwd() })
    .option('maxDepth', { type: 'number', default: 4, alias: 'd' })
    .option('verbose', { alias: 'v', type: 'boolean' })
    .help('help').argv

async function main() {
    console.log(
        printTree(await makeTreeWithInfo(argv.cwd), {
            maxDepth: argv.maxDepth,
        }),
    )
}

main().catch((e) => console.error(argv.verbose ? e : e.message))
