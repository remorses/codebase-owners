import { MyDirectoryTree } from './tree'
import chalk from 'chalk'
import { alignRight, numInRange } from './support'

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

const COLORS = [
    chalk.blue,
    chalk.cyan,
    chalk.green,
    chalk.magenta,
    chalk.italic,
    chalk.greenBright,
]

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

    // ADD THE CONTRIBUTOR INFO
    if (!node.topContributorDetails.percentage) {
        return lines
    }

    const author = node.topContributorDetails.author
    const percentage =
        (node.topContributorDetails.percentage * 100).toFixed(0) + '%'
    let color = options.colors[author]
    if (!color) {
        const l = Object.keys(options.colors).length
        const i = numInRange(l, [0, COLORS.length - 1])
        // console.log({ i })
        color = COLORS[i]
        options.colors[author] = color
    }
    const postfix = ` ${color(('   ' + percentage).slice(-4))} ${author}`
    line.push(options.alignRight ? alignRight(line.join(''), postfix) : postfix)

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
    alignRight?: boolean
    colors?: Record<string, any>
}

const DEFAULT_OPTIONS: TreeOptions = {
    alignRight: true,
    allFiles: false,
    dirsFirst: false,
    dirsOnly: false,
    exclude: [],
    maxDepth: Number.POSITIVE_INFINITY,
    reverse: false,
    trailingSlash: false,
    colors: {},
}

export function printTree(
    node: MyDirectoryTree,
    options: TreeOptions = {},
): string {
    const combinedOptions = Object.assign({}, DEFAULT_OPTIONS, options)
    return print(node, 0, '', combinedOptions).join('\n')
}
