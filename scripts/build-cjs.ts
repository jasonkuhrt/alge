import { execaCommand } from 'execa'
import Glob from 'fast-glob'
import Fs from 'fs-jetpack'
import * as Path from 'node:path'

const mode: Mode = `cjs`

const modeDefault: Mode = `esm`

type Mode = 'cjs' | 'esm'

const oppositeMode = {
  esm: `cjs`,
  cjs: `esm`,
} as const

const typeScriptExtensions = {
  cjs: { node: `cjs`, ts: `cts` },
  esm: { node: `mjs`, ts: `mts` },
  default: { node: `js`, ts: `ts` },
} as const

const getOppositeExtension = (mode: Mode) => {
  const thisOppositeMode = oppositeMode[mode]
  if (thisOppositeMode === modeDefault) return typeScriptExtensions[`default`]
  return typeScriptExtensions[thisOppositeMode]
}

const getExtension = (mode: Mode) => {
  if (mode === modeDefault) return typeScriptExtensions[`default`]
  return typeScriptExtensions[mode]
}

const changeImportFilePathMode = (mode: Mode, string: string) => {
  return string.replace(
    new RegExp(`\\.${getOppositeExtension(mode).node}'$`, `gm`),
    `.${getExtension(mode).node}'`
  )
}

const changeFilePathMode = (mode: Mode, string: string) => {
  return string.replace(
    new RegExp(`\\.${getOppositeExtension(mode).ts}$`, `g`),
    `.${typeScriptExtensions[mode].ts}`
  )
}

await execaCommand(`pnpm tsc --project tsconfig.esm.json`, { stdio: `inherit` })

const files = await Glob(`src/**/*.${getOppositeExtension(mode).ts}`)

if (files.length === 0) {
  console.log(`No files found.`)
  process.exit(1)
}

await Promise.all(
  files.map(async (oldFilePath) => {
    const newFilePath = changeFilePathMode(mode, oldFilePath)
    await Fs.renameAsync(oldFilePath, Path.basename(newFilePath))
    // filePath comes from glob so we know it exists
    // eslint-disable-next-line
    const oldFileContents = Fs.read(newFilePath)!
    const newFileContents = changeImportFilePathMode(mode, oldFileContents)
    await Fs.writeAsync(newFilePath, newFileContents)
  })
)

await execaCommand(`pnpm tsc --project tsconfig.${mode}.json`, { stdio: `inherit` })

await Promise.all(
  files.map(async (oldFilePath) => {
    const newFilePath = changeFilePathMode(mode, oldFilePath)
    await Fs.renameAsync(newFilePath, Path.basename(oldFilePath))
    // filePath comes from glob so we know it exists
    // eslint-disable-next-line
    const newFileContents = Fs.read(oldFilePath)!
    const oldFileContents = changeImportFilePathMode(oppositeMode[mode], newFileContents)
    await Fs.writeAsync(oldFilePath, oldFileContents)
  })
)
