import { Initial } from './types'
import { is } from '~/core/helpers'
import { ExtensionsBase } from '~/core/types'
import { SomeCodecDefinition, SomeSchema, SomeVariant, SomeVariantDefinition } from '~/core/typesInternal'
import { z } from 'zod'

export const datum = <Name extends string>(name: Name): Initial<Name> => {
  const currentVariant: SomeVariantDefinition = {
    name,
    schema: z.object({ _tag: z.literal(name) }),
    extensions: {},
  }

  const builder = {
    schema: (schema: SomeSchema) => {
      currentVariant.schema = z.object({ ...schema, _tag: z.literal(currentVariant.name) })
      return builder
    },
    extend: (extensions: ExtensionsBase) => {
      currentVariant.extensions = {
        ...currentVariant.extensions,
        ...extensions,
      }
      return builder
    },
    codec: (codecDef: SomeCodecDefinition) => {
      if (currentVariant.codec) throw new Error(`Codec already defined.`)
      currentVariant.codec = codecDef
      return builder
    },
    done: () => {
      const symbol = Symbol(currentVariant.name)
      const controller = {
        ...currentVariant,
        create: (input?: object) => ({
          _tag: currentVariant.name,
          _: {
            symbol,
          },
          ...input,
        }),
        symbol,
        //eslint-disable-next-line
        is$: (value: unknown) => is(value, symbol),
        is: (value: unknown) => is(value, symbol),
        decode: (value: string) => {
          if (!currentVariant.codec) throw new Error(`Codec not implemented.`)
          const data = currentVariant.codec.decode(value, {
            ...currentVariant.extensions,
            schema: currentVariant.schema,
            name: currentVariant.name,
          })
          if (data === null) return null
          // TODO
          // eslint-disable-next-line
          return controller.create(data)
        },
        decodeOrThrow: (value: string) => {
          const data = controller.decode(value)
          if (data === null) throw new Error(`Failed to decode value \`${value}\` into a ${name}.`)
          return data
        },
        encode: (variant: SomeVariant) => {
          if (!currentVariant.codec) throw new Error(`Codec not implemented.`)
          return currentVariant.codec.encode(variant)
        },
        ...currentVariant.extensions,
      }
      return controller
    },
  }

  // TODO
  // eslint-disable-next-line
  return builder as any
}
