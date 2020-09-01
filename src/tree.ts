import fs from 'fs'
import nodePath from 'path'
import { boolean } from 'yargs'

export type TreeOptions = {
    allFiles?: boolean
    addToLine?: (x?: { filename; filePath }) => string
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

const SYMBOLS = {
    BRANCH: '├── ',
    EMPTY: '',
    INDENT: '    ',
    LAST_BRANCH: '└── ',
    VERTICAL: '│   ',
}

const EXCLUDED_PATTERNS = [/\.DS_Store/]

function isHiddenFile(filename) {
    return filename[0] === '.'
}

function print(
    filename,
    path,
    currentDepth,
    precedingSymbols,
    options: TreeOptions,
    isLast = false,
) {
    const isDir = fs.lstatSync(path).isDirectory()
    // We treat all non-directory paths as files and don't
    // recurse into them, including symlinks, sockets, etc.
    const isFile = !isDir

    const lines = []

    // Do not show these regardless.
    for (let i = 0; i < EXCLUDED_PATTERNS.length; i++) {
        if (EXCLUDED_PATTERNS[i].test(path)) {
            return lines
        }
    }

    // Handle directories only.
    if (isFile && options.dirsOnly) {
        return lines
    }

    // Handle excluded patterns.
    for (let i = 0; i < options.exclude.length; i++) {
        if (options.exclude[i].test(path)) {
            return lines
        }
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
    line.push(filename)
    if (isDir && options.trailingSlash) {
        line.push('/')
    }

    if (options.addToLine) {
        line.push(options.addToLine({ filename, filePath: path }))
    }

    lines.push(line.join(''))

    if (isFile) {
        return lines
    }

    // Contents of a directory.
    let contents = fs.readdirSync(path)
    if (options.reverse) {
        contents.reverse()
    }

    // Handle showing of all files.
    if (!options.allFiles) {
        contents = contents.filter((content) => !isHiddenFile(content))
    }

    if (options.dirsOnly) {
        // We have to filter here instead of at the start of the function
        // because we need to know how many non-directories there are before
        // we even start recursing.
        contents = contents.filter((file) =>
            fs.lstatSync(nodePath.join(path, file)).isDirectory(),
        )
    }

    // Sort directories first.
    if (options.dirsFirst) {
        const dirs = contents.filter((content) =>
            fs.lstatSync(nodePath.join(path, content)).isDirectory(),
        )
        const files = contents.filter(
            (content) =>
                !fs.lstatSync(nodePath.join(path, content)).isDirectory(),
        )
        contents = [].concat(dirs, files)
    }

    contents.forEach((content, index) => {
        const isCurrentLast = index === contents.length - 1
        const linesForFile = print(
            content,
            nodePath.join(path, content),
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

export function makeTree(path, options: TreeOptions = {}): string {
    const combinedOptions = Object.assign({}, DEFAULT_OPTIONS, options)
    return print(
        nodePath.basename(nodePath.join(process.cwd(), path)),
        path,
        0,
        '',
        combinedOptions,
    ).join('\n')
}
