import fs from 'fs'
import chalk from 'chalk'
import nodePath from 'path'
import { boolean, number } from 'yargs'
import dirTree, { DirectoryTree } from 'directory-tree'
import { getFileOwners, makeHist, arrayMax, bfs, average } from './support'

export type MyDirectoryTree = {
    path: string
    name: string
    size: number
    type: 'directory' | 'file'
    children?: MyDirectoryTree[]
    extension?: string
    topContributorDetails?: { percentage; author }
}

export function makeTreeWithInfo(cwd) {
    // TODO first create the tree object, do a reversed breadth first search, getting top contributors for every file and adding to a cache with { absPath, linesCount, topContributor, topContributorPercentage }, every directory has percentage as weighted average on its direct children, then print the tree
    const tree = dirTree(cwd, {
        exclude: [/node_modules/, /\.git/], // TODO more default excludes from gitignore
    })
    const nodes: Array<MyDirectoryTree> = bfs(tree).reverse()
    nodes.forEach((node) => {
        const isDir = node.type === 'directory'
        const filePath = node.path
        // TODO isDir percentage is based on children percentages
        if (isDir && node?.children?.length) {
            const author = arrayMax(
                node.children || [],
                (x) => x.topContributorDetails.percentage,
            ).topContributorDetails.author
            const percentage = average(
                node.children
                    .filter((x) => x.topContributorDetails.author === author)
                    .map((x) => x.topContributorDetails.percentage),
            )
            node.topContributorDetails = {
                author,
                percentage,
            }
            return
        }
        const authors = getFileOwners({
            filePath,
        })
        const hist = makeHist(authors)
        const contributorsDetails = Object.keys(hist).map((author) => {
            const lines = hist[author]
            return { percentage: lines / authors.length, author }
        })

        node.topContributorDetails = arrayMax(
            contributorsDetails,
            (x) => x.percentage,
        )
    })
    return tree
}

const SYMBOLS = {
    BRANCH: '├── ',
    EMPTY: '',
    INDENT: '    ',
    LAST_BRANCH: '└── ',
    VERTICAL: '│   ',
}

function isHiddenFile(filename) {
    return filename[0] === '.'
}

function print(
    node: MyDirectoryTree,
    currentDepth,
    precedingSymbols,
    options: TreeOptions,
    isLast = false,
) {
    const isDir = node.type === 'directory'
    // We treat all non-directory paths as files and don't
    // recurse into them, including symlinks, sockets, etc.
    const isFile = !isDir

    const lines = []

    // Handle directories only.
    if (isFile && options.dirsOnly) {
        return lines
    }

    // Handle max depth.
    if (currentDepth > options.maxDepth) {
        return lines
    }

    // Handle current file.
    const line = [precedingSymbols]
    if (currentDepth >= 1) {
        line.push(isLast ? SYMBOLS.LAST_BRANCH : SYMBOLS.BRANCH)
    }
    line.push(node.name)
    if (isDir && options.trailingSlash) {
        line.push('/')
    }

    lines.push(line.join(''))

    if (isFile) {
        return lines
    }

    // Contents of a directory.
    let dirFiles = (node.children || []).map((x) => x.name)
    if (options.reverse) {
        dirFiles.reverse()
    }

    // Handle showing of all files.
    if (!options.allFiles) {
        dirFiles = dirFiles.filter((content) => !isHiddenFile(content))
    }

    // TODO options.dirsOnly
    // if TODO (options.dirsOnly) {
    //     // We have to filter here instead of at the start of the function
    //     // because we need to know how many non-directories there are before
    //     // we even start recursing.
    //     dirFiles = dirFiles.filter((file) =>
    //         fs.lstatSync(nodePath.join(path, file)).isDirectory(),
    //     )
    // }

    // // TODO Sort directories first.
    // if (options.dirsFirst) {
    //     const dirs = dirFiles.filter((content) =>
    //         fs.lstatSync(nodePath.join(path, content)).isDirectory(),
    //     )
    //     const files = dirFiles.filter(
    //         (content) =>
    //             !fs.lstatSync(nodePath.join(path, content)).isDirectory(),
    //     )
    //     dirFiles = [].concat(dirs, files)
    // }

    node.children.forEach((child, index) => {
        const isCurrentLast = index === dirFiles.length - 1
        const linesForFile = print(
            child,
            currentDepth + 1,
            precedingSymbols +
                (currentDepth >= 1
                    ? isLast
                        ? SYMBOLS.INDENT
                        : SYMBOLS.VERTICAL
                    : SYMBOLS.EMPTY),
            options,
            isCurrentLast,
        )
        lines.push.apply(lines, linesForFile)
    })
    return lines
}

export type TreeOptions = {
    allFiles?: boolean
    addToLine?: (x?: { filename; filePath; isDir }) => string
    dirsFirst?: boolean
    dirsOnly?: boolean
    exclude?: RegExp[] // | ((x?: string) => boolean)
    maxDepth?: number
    reverse?: boolean
    trailingSlash?: boolean
}

const DEFAULT_OPTIONS: TreeOptions = {
    allFiles: false,
    dirsFirst: false,
    dirsOnly: false,
    exclude: [],
    maxDepth: Number.POSITIVE_INFINITY,
    reverse: false,
    trailingSlash: false,
}

export function printTree(
    node: MyDirectoryTree,
    options: TreeOptions = {},
): string {
    const combinedOptions = Object.assign({}, DEFAULT_OPTIONS, options)
    return print(node, 0, '', combinedOptions).join('\n')
}
// const percentage =
//             (topContributorDetails.percentage * 100).toFixed(0) + '%'
// return ` ${chalk.cyan(percentage)} ${chalk.green(
//     topContributorDetails.author,
// )}`
