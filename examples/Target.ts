/**
 * This example shows:
 * - How other ADTs can be used to create a new ADT.
 * - How a singular variant can be created instead of a whole ADT.
 */
import { Moniker } from './Moniker'
import { SemVer } from './SemVer'
import { Alge } from '~/'
import { z } from 'zod'

type Version = Alge.Infer<typeof Version>

const Version = Alge.data(`Version`)
  // TODO
  // .variant(SemVer.Exact)
  .variant(`Tag`)
  .schema({
    name: z.string().min(1), // TODO regexp
  })
  .codec({
    encode: (tag) => tag.name,
    decode: (value) => {
      // According to npm docs a tag value is anything that is not interpretable as a semantic version
      // https://docs.npmjs.com/cli/v8/commands/npm-dist-tag#caveats
      if (SemVer.Exact.decode(value)) return null
      return { name: value }
    },
  })
  .done()

export const Target = Alge.datum(`Target`)
  .schema({
    moniker: Moniker.schema,
    version: Version.schema,
  })
  .codec({
    encode: (target) => {
      // The tag "latest" gets elided
      if (isTagLatest(target.version)) return Moniker.encode(target.moniker)
      return `${Moniker.encode(target.moniker)}@${Version.encode(target.version)}`
    },
    decode: (value) => {
      const result = value.match(/(.+)(?:@(.+))?/)
      if (!result) return null
      const [, monikerRaw, versionRaw = `latest`] = result as [string, string, undefined | string]
      const moniker = Moniker.decode(monikerRaw)
      const version = SemVer.Exact.decode(versionRaw)
      if (!moniker || !version) return null
      return {
        moniker,
        // TODO
        // version,
        version: { _tag: `Tag`, name: `abc` },
      }
    },
  })
  .done()

const isTagLatest = (version: Version['*']) => Version.Tag.is(version) && version.name === `latest`
