// @ts-expect-error
import ini from '@loice5/dangerous-ini'
import type { SynologyFilter } from './interfaces'
import { banDirNames } from './constants'
import type { BunFile } from 'bun'

export function parseIgnoreEnv(raw: string): string[] {
    const forbiddenPattern = /[\/\\:*?"<>|;,]/
    const trimmed   = raw.trim().replace(/,+$/, '')

    if (trimmed === '') return []

    return trimmed.split(',').map((entry: string, index: number) => {
        const clean = entry.trim().replace(/\/+$/, '')

        if (clean === '') {
            console.error(`Error: IGNORE entry at position ${index + 1} is empty after trimming.`)
            process.exit(1)
        }

        if (forbiddenPattern.test(clean)) {
            console.error(`Error: IGNORE entry "${clean}" contains a forbidden character. Forbidden: / \\ : * ? " < > | ; ,`)
            process.exit(1)
        }

        return clean
    })
}

export async function editConfigFile(path: string): Promise<void> {

    console.info(`Editing file : ${path}`)

    // Open the file
    const file: BunFile = Bun.file(path)
    const text: string = await file.text()

    await backupFile(file)

    // Get the file as an object
    const config = Object.assign({}, ini.parse(text)) satisfies SynologyFilter

    // Create some conditions for better code lisibility
    const hasDirectoryKey: boolean           = config.hasOwnProperty('Directory')
    const hasCommonKey: boolean              = config.hasOwnProperty('Common')
    const hasNodeModulesInDirectory: boolean = hasDirectoryKey && banDirNames.every(dir => config.Directory!.black_name.includes(dir))
    const hasNodeModulesInCommon: boolean    = hasCommonKey && banDirNames.every(dir => config.Common!.black_name.includes(dir))

    if (
        (hasNodeModulesInDirectory && !hasCommonKey) ||
        (hasNodeModulesInDirectory && hasNodeModulesInCommon)
    )
        return console.info(`The directories ${banDirNames.join(', ')} are already banned. No further action is needed.`)

    // If there is no Directory key, we create one and add directories in the blacklist, otherwise and if not already present, we add directories in Directory's blacklist
    if (!hasDirectoryKey)
        config.Directory = {
            black_name: banDirNames.map(dir => `"${dir}"`).join(', ')
        }
    else {
        banDirNames.forEach(dir => {
            if (!config.Directory!.black_name.includes(dir)) {
                config.Directory!.black_name += `, "${dir}"`
            }
        })
    }

    // If the Common key exists in the file, we add directories in the blacklist
    if (hasCommonKey) {
        banDirNames.forEach(dir => {
            if (!config.Common!.black_name.includes(dir)) {
                config.Common!.black_name += `, "${dir}"`
            }
        })
    }

    // We save the file
    const updatedConfig: string = ini.stringify(config) satisfies string
    try {
        await Bun.write(path, updatedConfig)
    } catch (error: unknown) {
        await fallbackFileWrite(path, updatedConfig)
    }

    console.info(`${banDirNames.join(', ')} have been successfully banned from Synology Drive.`)
}

export async function backupFile(file: BunFile): Promise<void> {
    const fileName = file.name?.split('/').at(-1)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `${fileName}.${timestamp}.backup`
    const path = `${process.cwd()}/backups/${backupFileName}`

    try {
        await Bun.write(path, file)
    } catch (error: unknown) {
        await fallbackFileWrite(path, await file.text())
    }

    console.info(`File backed-up successfully to ${backupFileName}`)
}

export async function fallbackFileWrite(path: string, fileContent: string): Promise<void> {
    const fs = await import('fs')
    fs.writeFileSync(path, fileContent)
    console.info(`🧐 For some reason, Bun.write() fails on your device. We've switched it to fs.writeFileSync() for you! If you see this, the edits have succeeded.`)
}