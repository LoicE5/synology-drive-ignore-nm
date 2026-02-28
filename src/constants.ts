import os from 'node:os'
import { parseIgnoreEnv } from './functions'

export const args = process.argv.slice(2)
export const ignoreArg = args.find(arg => arg.startsWith('--ignore='))
export const envIgnore = process.env.IGNORE

export const defaultList = ['node_modules']
export const hasEnv      = envIgnore !== undefined
export const hasCLI      = ignoreArg !== undefined
export const envList     = hasEnv ? parseIgnoreEnv(envIgnore!) : []
export const cliList     = hasCLI ? ignoreArg!.split('=').at(1)!.split(',').map(s => s.trim()) : []
export const banDirNames = hasCLI ? [...defaultList, ...envList, ...cliList]
                                  : (hasEnv ? envList : defaultList)

export const directory = `${os.homedir()}/Library/Application Support/SynologyDrive/SynologyDrive.app/Contents/Resources/conf`
export const paths = {
    blacklist: `${directory}/blacklist.filter`,
    filterV450: `${directory}/filter-v4150`
}