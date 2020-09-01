import fs from 'fs'
import chalk from 'chalk'
import nodePath from 'path'
import { boolean, number } from 'yargs'
import dirTree, { DirectoryTree } from 'directory-tree'
import { getFileOwners, makeHist, arrayMax, bfs } from './support'

export function makeTreeWithInfo(cwd) {
    // TODO first create the tree object, do a reversed breadth first search, getting top contributors for every file and adding to a cache with { absPath, linesCount, topContributor, topContributorPercentage }, every directory has percentage as weighted average on its direct children, then print the tree
    const tree = dirTree(cwd, {
        exclude: [/node_modules/, /\.git/], // TODO more default excludes from gitignore
    })
    const nodes: Array<
        DirectoryTree & { topContributorDetails: { percentage; author } }
    > = bfs(tree).reverse()
    nodes.forEach((node) => {
        const isDir = node.type === 'directory'
        const filePath = node.path
        // TODO isDir percentage is based on children percentages
        if (isDir) {
            return ''
        }
        const authors = getFileOwners({
            filePath,
        })
        const hist = makeHist(authors)
        const contributorsDetails = Object.keys(hist).map((author) => {
            const lines = hist[author]
            return { percentage: lines / authors.length, author }
        })
        const topContributorDetails = arrayMax(
            contributorsDetails,
            (x) => x.percentage,
        )

        node.topContributorDetails = topContributorDetails
    })
    return tree
}

// const percentage =
//             (topContributorDetails.percentage * 100).toFixed(0) + '%'
// return ` ${chalk.cyan(percentage)} ${chalk.green(
//     topContributorDetails.author,
// )}`
