import { Alge } from '../src'
import { z } from 'zod'

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
  .codec({
    encode: (moniker) => `@${moniker.scope}/${moniker.name}`,
    decode: (value) => {
      const match = Patterns.Modern.local.exec(value)
      if (match === null) return null
      // eslint-disable-next-line
      return { name: match[1]!, scope: match[2]! }
    },
  })
  .variant(`Global`, {
    name: z.string().nonempty(),
  })
  .codec({
    encode: (moniker) => moniker.name,
    decode: (value) => {
      const match = Patterns.Modern.global.exec(value)
      if (match === null) return null
      // eslint-disable-next-line
      return { name: match[1]! }
    },
  })

//eslint-disable-next-line
export namespace Patterns {
  //eslint-disable-next-line
  export namespace Modern {
    /**
     * https://regex101.com/r/F0YjpY/1
     */
    export const global = /^([a-z0-9-~][a-z0-9-._~]*)$/
    export const local = /^(?:@([a-z0-9-~][a-z0-9-._~]*)\/)([a-z0-9-~][a-z0-9-._~]*)$/
  }

  /**
   * Upper-case used to be allowed, example: https://www.npmjs.com/package/A.
   *
   * They are no longer allowed however: https://blog.npmjs.org/post/168978377570/new-package-moniker-rules.html.
   */
  export const legacy = /^(?:@([a-z0-9-~][a-z0-9-._~]*)\/)?([A-Za-z0-9-~][a-z0-9-._~]*)$/
}
