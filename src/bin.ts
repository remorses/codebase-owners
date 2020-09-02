#!/usr/bin/env node
import yargs from 'yargs'
import { printTree, makeTreeWithInfo } from './'

const argv = yargs
    .option('cwd', { type: 'string', default: process.cwd() })
    .option('verbose', { alias: 'v', type: 'boolean' })
    .help('help').argv

async function main() {
    console.log(printTree(await makeTreeWithInfo(argv.cwd)))
}

main().catch((e) => console.error(argv.verbose ? e : e.message))
