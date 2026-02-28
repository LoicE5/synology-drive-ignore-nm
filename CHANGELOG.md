# Changelog

## 1.1.0

### Added
- Persistent block list via `IGNORE=` environment variable in `.env`
- `.env.example` template file with common defaults
- `env:init` script (`bun run env:init`) to initialise `.env` from the template without overwriting an existing one
- `build.ts` build script that embeds the `IGNORE=` value into compiled binaries at build time via `--define`, so the list is retained when the binary is moved
- `build:arm64` and `build:x64` scripts now delegate to `build.ts` to benefit from the same embedding logic
- Startup log: the resolved list of ignored directories is printed at launch
- Validation of `IGNORE=`: trims whitespace, removes trailing slashes and commas, exits with a descriptive error on forbidden characters
- `fallbackFileWrite` utility used consistently by both `editConfigFile` and `backupFile` when `Bun.write()` is unavailable

### Changed
- Source files moved to `src/` and split into `index.ts`, `constants.ts`, `functions.ts`, `interfaces.ts`, `build.ts`
- `node_modules` is now merged automatically only when `--ignore` is used; when only `IGNORE=` is set, that list is used as-is

## 1.0.0

### Added
- Initial release
- Modifies Synology Drive filter files to prevent `node_modules` from being synced
- `--ignore=` CLI flag to add extra directories at runtime
- Backup of config files before any modification
- Pre-built binaries for Apple Silicon and Intel Macs
