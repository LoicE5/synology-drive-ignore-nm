import ini from 'ini'
import os from 'node:os'

interface SynologyFilter {
    Version: {
      major: string;
      minor: string;
    };
    Common: {
      black_char: string;
      black_name: string;
      max_length: string;
      max_path: string;
    };
    File: {
      black_name: string;
      black_prefix: string;
      max_size: string;
    };
    Directory: {
      black_name: string;
    };
    EA: {};
}

const banDirName = 'node_modules'
const directory = `${os.homedir()}/Library/Application Support/SynologyDrive/SynologyDrive.app/Contents/Resources/conf`
const paths = {
    filter: `${directory}/filter`,
    filterV450: `${directory}/filter-v4150`
}

async function main() {
    await editConfigFile(paths.filter)
    await editConfigFile(paths.filterV450)
}

async function editConfigFile(path: string): Promise<void> {

    console.info(`Editing file : ${path}`)

    const file = Bun.file(path)
    const text = await file.text()

    const config = ini.parse(text) as SynologyFilter

    if (config.Directory.black_name.includes(banDirName))
        return console.info(`The directory ${banDirName} is already ignored by Synology Drive.`)

    config.Directory.black_name += `, \"${banDirName}\"`
    config.Common.black_name += `, \"${banDirName}\"`

    const updatedConfig = ini.stringify(config)
    await Bun.write(path, updatedConfig)

    console.info(`${banDirName} have been successfully banned from Synology Drive.`)
}

main()