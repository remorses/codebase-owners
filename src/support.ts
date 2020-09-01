const util = require('util')
import { exec } from 'promisify-child-process'
import { execSync } from 'child_process'
// export const exec = util.promisify(exec_)

const DEFAULT_AUTHOR_REGEX = /\nauthor-mail <(.*)>/g

export function getFileOwners({ filePath, regex = DEFAULT_AUTHOR_REGEX }) {
    let stdout = execSync(`git blame -w --line-porcelain ${filePath}`)
    const data = stdout.toString()

    let match
    let results = []
    while ((match = regex.exec(data.toString())) !== null) {
        const authorEmail = match[1] || ''
        if (authorEmail && authorEmail !== 'not.committed.yet') {
            results.push(authorEmail)
        }
        // expected output: "Found foo. Next starts at 9."
        // expected output: "Found foo. Next starts at 19."
    }
    return results
}
