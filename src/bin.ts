#!/usr/bin/env node
import yargs from 'yargs'

const argv = yargs
    .option('cwd', { type: 'string' })
    .option('verbose', { alias: 'v', type: 'boolean' })
    .help('help').argv

async function main() {
    
}

main().catch((e) => console.error(argv.verbose ? e : e.message))
