import { Alge } from '../src'
import { z } from 'zod'

type MonikerInferred = Alge.Infer<typeof Moniker>

export type Moniker = MonikerInferred['*']

export namespace Moniker {
  export type Local = MonikerInferred['Local']
  export type Global = MonikerInferred['Global']
}

const replace = (pattern: RegExp, replacementValue: string) => (value: string) =>
  value.replace(pattern, replacementValue)

export const Moniker = Alge.create(`Moniker`)
  .variant(`Local`, {
    name: z.string().nonempty(),
    scope: z
      .string()
      .nonempty()
      // Strip leading @ on scope if given
      .transform(replace(/^@/, ``)),
  })
  .extend({
    /**
     * https://regex101.com/r/F0YjpY/1
     */
    pattern: /^(?:@([a-z0-9-~][a-z0-9-._~]*)\/)([a-z0-9-~][a-z0-9-._~]*)$/,
  })
  .codec({
    encode: (moniker) => `@${moniker.scope}/${moniker.name}`,
    decode: (value, extensions) => {
      const match = extensions.pattern.exec(value)
      if (match === null) return null
      // eslint-disable-next-line
      return { name: match[1]!, scope: match[2]! }
    },
  })
  .variant(`Global`, {
    name: z.string().nonempty(),
  })
  .extend({
    /**
     * Regular expressions of allowed npm package names.
     * Divided into modern and legacy. Npm package name rules changed once a long time ago.
     */
    pattern: {
      /**
       * https://regex101.com/r/F0YjpY/1
       */
      modern: /^([a-z0-9-~][a-z0-9-._~]*)$/,
      /**
       * Upper-case used to be allowed, example: https://www.npmjs.com/package/A.
       *
       * They are no longer allowed however: https://blog.npmjs.org/post/168978377570/new-package-moniker-rules.html.
       */
      legacy: /^([A-Za-z0-9-~][a-z0-9-._~]*)$/,
    },
  })
  .codec({
    encode: (moniker) => moniker.name,
    decode: (value, extensions) => {
      const match = extensions.pattern.modern.exec(value)
      if (match === null) return null
      // eslint-disable-next-line
      return { name: match[1]! }
    },
  })
  .done()
