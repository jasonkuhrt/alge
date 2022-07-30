import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: `ts-jest/presets/default-esm`,
  snapshotFormat: {
    printBasicPrototype: false,
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': `$1`,
  },
  watchPlugins: [
    `jest-watch-typeahead/filename`,
    `jest-watch-typeahead/testname`,
    `jest-watch-select-projects`,
    `jest-watch-suspend`,
  ],
  // TODO
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
}

export default config
