#!/usr/bin/env node
import yargs from 'yargs'
import { printTree, makeTreeWithInfo } from './'

const argv = yargs
    .option('cwd', { type: 'string', default: process.cwd() })
    .option('alignRight', { type: 'boolean' })
    .option('verbose', { alias: 'v', type: 'boolean' })
    .help('help').argv

async function main() {
    console.log(
        printTree(await makeTreeWithInfo(argv.cwd), {
            alignRight: argv.alignRight,
        }),
    )
}

main().catch((e) => console.error(argv.verbose ? e : e.message))
