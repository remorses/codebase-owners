import fs from 'fs'
import chalk from 'chalk'
import nodePath from 'path'
import { boolean, number } from 'yargs'
import directoryTree, { DirectoryTree } from 'directory-tree'
import findUp from 'find-up'
import globToRegex from 'glob-to-regexp'
import { groupBy } from 'lodash'
import gitignoreToGlobs from 'gitignore-to-glob'
import {
    getFileOwners,
    makeHist,
    arrayMax,
    bfs,
    average,
    weightedAverage,
} from './support'

export type MyDirectoryTree = {
    path: string
    depth?: number
    name: string
    size: number
    type: 'directory' | 'file'
    children?: MyDirectoryTree[]
    extension?: string
    topContributorDetails?: {
        percentage: number
        author: string
        accumulatedLinesCount: number
    }
}

function getTreeLayersLeafFirst(tree: MyDirectoryTree) {
    const nodes: Array<MyDirectoryTree> = bfs(tree)
    const layers = groupBy(nodes, (x) => x.depth)
    const groups = Object.keys(layers)
        .map(Number)
        .sort((a, b) => a - b)
        .map((k) => layers[String(k)])
        .reverse()
    return groups
}

// first create the tree object, do a reversed breadth first search, getting top contributors for every file and adding to a cache with { absPath, linesCount, topContributor, topContributorPercentage }, every directory has percentage as weighted average on its direct children, then print the tree
export async function makeTreeWithInfo(cwd) {
    const gitignoreExclude = await getGitIgnoreRegexes()
    const tree = directoryTree(cwd, {
        exclude: [/node_modules/, /\.git/, ...gitignoreExclude], // TODO default excludes from gitignore not working
    })
    const layers = getTreeLayersLeafFirst(tree)
    console.log(
        `processing ${
            layers.length
        } tree layers concurrently, with in average ${average(
            layers.map((x) => x.length),
        )} nodes each`,
    )
    for (let nodes of layers) {
        await Promise.all(
            nodes.map(async (node) => {
                const isDir = node.type === 'directory'
                const filePath = node.path
                if (isDir && node?.children?.length) {
                    const author = arrayMax(
                        node.children || [],
                        (x) => x.topContributorDetails.percentage,
                    ).topContributorDetails.author
                    const linesWritten = node.children
                        .filter(
                            (x) => x.topContributorDetails.author === author,
                        )
                        .map(
                            (x) =>
                                x.topContributorDetails.accumulatedLinesCount,
                        )
                    const percentage = weightedAverage(
                        node.children
                            .filter(
                                (x) =>
                                    x.topContributorDetails.author === author,
                            )
                            .map((x) => x.topContributorDetails.percentage),
                        linesWritten,
                    )
                    node.topContributorDetails = {
                        author,
                        percentage,
                        accumulatedLinesCount: linesWritten.reduce(
                            (a, b) => a + b,
                            0,
                        ),
                    }
                    return
                }
                const authors = await getFileOwners({
                    filePath,
                })
                if (!authors?.length) {
                    node.topContributorDetails = {
                        percentage: 0,
                        author: '',
                        accumulatedLinesCount: 0,
                    }
                    return
                }
                const hist = makeHist(authors)
                const contributorsDetails = Object.keys(hist).map((author) => {
                    const lines = hist[author]
                    return {
                        percentage: lines / authors.length,
                        author,
                        accumulatedLinesCount: lines,
                    }
                })

                node.topContributorDetails = arrayMax(
                    contributorsDetails,
                    (x) => x.percentage,
                )
            }),
        )
    }

    return tree
}

export async function getGitIgnoreRegexes() {
    try {
        const gitignorePath = await findUp('.gitignore')
        const globsToIgnore = gitignoreToGlobs(gitignorePath) || []
        return globsToIgnore.map((x) => globToRegex(x, { globstar: true }))
    } catch {
        return []
    }
}
