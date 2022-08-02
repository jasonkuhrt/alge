/**
 * This example shows:
 * - How other ADTs can be used to create a new ADT.
 * - How a lone record can be created instead of a whole ADT.
 */
import { Alge } from '../src/index.js'
import { Moniker } from './Moniker.js'
import { SemVer } from './SemVer.js'
import { z } from 'zod'

type Version = Alge.Infer<typeof Version>

const Version = Alge.data(`Version`)
  .record(SemVer.Exact)
  .record(`Tag`)
  .schema({
    name: z.string().min(1), // TODO regexp
  })
  .codec(`string`, {
    to: (tag) => tag.name,
    from: (string) => {
      // According to npm docs a tag value is anything that is not interpretable as a semantic version
      // https://docs.npmjs.com/cli/v8/commands/npm-dist-tag#caveats
      if (SemVer.Exact.from.string(string)) return null
      return { name: string }
    },
  })
  .done()

export const Target = Alge.record(`Target`)
  .schema({
    moniker: Moniker.schema,
    version: Version.schema,
  })
  .codec(`string`, {
    to: (target) => {
      // The tag "latest" gets elided
      if (isTagLatest(target.version)) return Moniker.to.string(target.moniker)
      return `${Moniker.to.string(target.moniker)}@${Version.to.string(target.version)}`
    },
    from: (value) => {
      const result = value.match(/(.+)(?:@(.+))?/)
      if (!result) return null
      const [, monikerRaw, versionRaw = `latest`] = result as [string, string, undefined | string]
      const moniker = Moniker.from.string(monikerRaw)
      const version = SemVer.Exact.from.string(versionRaw)
      if (!moniker || !version) return null
      return {
        moniker,
        version,
      }
    },
  })
  .done()

const isTagLatest = (version: Version['*']) => Version.Tag.is(version) && version.name === `latest`
