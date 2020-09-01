const util = require('util')
import { exec } from 'promisify-child-process'
// export const exec = util.promisify(exec_)

const DEFAULT_AUTHOR_REGEX = /\nauthor-mail <(.*)>/g

export async function getFileOwners({
    filePath,
    regex = DEFAULT_AUTHOR_REGEX,
}) {
    let { stdout, stderr } = await exec(
        `git blame -w --line-porcelain ${filePath}`,
    )
    stdout = stdout.toString()

    let match
    let results = []
    while ((match = regex.exec(stdout.toString())) !== null) {
        const authorEmail = match[1] || ''
        if (authorEmail && authorEmail !== 'not.committed.yet') {
            results.push({ author: authorEmail })
        }
        // expected output: "Found foo. Next starts at 9."
        // expected output: "Found foo. Next starts at 19."
    }
    return results
}
