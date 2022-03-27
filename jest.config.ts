import { Config } from '@jest/types'
import * as Fs from 'fs'
import { pathsToModuleNameMapper } from 'ts-jest'
import * as TypeScript from 'typescript'

const tsconfig: {
  config?: { compilerOptions?: { paths?: Record<string, string[]> } }
  error?: TypeScript.Diagnostic
} = TypeScript.readConfigFile(`tsconfig.json`, (path) => Fs.readFileSync(path, { encoding: `utf-8` }))

const config: Config.InitialOptions = {
  snapshotFormat: {
    printBasicPrototype: false,
  },
  transform: {
    '^.+\\.ts$': `@swc/jest`,
  },
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.config?.compilerOptions?.paths ?? {}, {
    prefix: `<rootDir>`,
  }),
  watchPlugins: [
    `jest-watch-typeahead/filename`,
    `jest-watch-typeahead/testname`,
    `jest-watch-select-projects`,
    `jest-watch-suspend`,
  ],
}

export default config
