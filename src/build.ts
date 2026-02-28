import { $ } from 'bun'

const ignoreValue = process.env.IGNORE

const defineFlag: string[] = ignoreValue !== undefined
    ? ['--define', `process.env.IGNORE=${JSON.stringify(ignoreValue)}`]
    : []

const target = process.argv.at(2) // 'arm64', 'x64', or undefined (build both)

if (!target || target === 'arm64')
    await $`bun build src/index.ts --compile --target=bun-darwin-arm64 --outfile dist/synology-drive-ignore-nm-arm64 ${defineFlag}`

if (!target || target === 'x64')
    await $`bun build src/index.ts --compile --target=bun-darwin-x64 --outfile dist/synology-drive-ignore-nm-x64 ${defineFlag}`
