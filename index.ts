// @ts-ignore
import ini from '@loice5/dangerous-ini'
import type { BunFile } from 'bun'
import os from 'node:os'

interface SynologyFilter {
    Version: {
      major: string
      minor: string
    }
    Common?: {
      black_char: string
      black_name: string
      max_length: string
      max_path: string
    }
    File?: {
      black_name: string
      black_prefix: string
      max_size: string
    }
    Directory?: {
      black_name: string
    }
    EA?: {}
}

const banDirName = 'node_modules'
const directory = `${os.homedir()}/Library/Application Support/SynologyDrive/SynologyDrive.app/Contents/Resources/conf`
const paths = {
    blacklist: `${directory}/blacklist.filter`,
    filterV450: `${directory}/filter-v4150`
}

async function main() {
    await editConfigFile(paths.blacklist)
    await editConfigFile(paths.filterV450)
}

async function editConfigFile(path: string): Promise<void> {

    console.info(`Editing file : ${path}`)

    // Open the file
    const file: BunFile = Bun.file(path)
    const text: string = await file.text()

    await backupFile(file)

    // Get the file as an object
    const config = Object.assign({}, ini.parse(text)) as SynologyFilter

    // Create some conditions for better code lisibility
    const hasDirectoryKey: boolean = config.hasOwnProperty('Directory')
    const hasCommonKey: boolean = config.hasOwnProperty('Common')
    const hasNodeModulesInDirectory: boolean = hasDirectoryKey && config.Directory!.black_name.includes(banDirName)
    const hasNodeModulesInCommon: boolean = hasCommonKey && config.Common!.black_name.includes(banDirName)

    if (
        (hasNodeModulesInDirectory && !hasCommonKey) ||
        (hasNodeModulesInDirectory && hasNodeModulesInCommon)
    )
        return console.info(`The directory ${banDirName} is already banned. No further action is needed.`)

    // If there is no Directory key, we create one and add node_modules in the blacklist, otherwise and if not already present, we add node_modules in Directory's blacklist
    if (!hasDirectoryKey)
        config.Directory = {
            black_name: `"${banDirName}"`
        }
    else if (!hasNodeModulesInDirectory)
        config.Directory!.black_name += `, "${banDirName}"`

    // If the Common key exists in the file, we add node_modules in the blacklist
    if (hasCommonKey)
        config.Common!.black_name += `, "${banDirName}"`

    // We save the file
    const updatedConfig = ini.stringify(config)
    await Bun.write(path, updatedConfig)

    console.info(`${banDirName} have been successfully banned from Synology Drive.`)
}

async function backupFile(file: BunFile): Promise<void> {
    const fileName = file.name?.split('/').at(-1)
    const path = `${os.homedir()}/Desktop/${fileName}`

    await Bun.write(path, file)
    
    console.log('File backed-up successfully.')
}

main()