import { banDirNames, paths } from './constants'
import { editConfigFile } from './functions'

try {
    console.info(`Ignored directories: ${banDirNames.join(', ')}`)

    await editConfigFile(paths.blacklist)
    await editConfigFile(paths.filterV450)

    console.info('Operation completed successfully.')
} catch (error: unknown) {
    console.error('An error occurred:', error)
}