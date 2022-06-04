import { Initial } from './types'
import { is } from '~/core/helpers'
import { ExtensionsBase } from '~/core/types'
import {
  SomeCodecDefinition,
  SomeDefaultsProvider,
  SomeSchema,
  SomeVariant,
  SomeVariantDefinition,
} from '~/core/typesInternal'
import { z } from 'zod'

export const datum = <Name extends string>(name: Name): Initial<Name> => {
  const initialSchema = z.object({ _tag: z.literal(name) })
  const currentVariant: SomeVariantDefinition = {
    name,
    schema: initialSchema,
    extensions: {},
    defaultsProvider: null,
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
    defaults: (defaultsProvider: SomeDefaultsProvider) => {
      if (currentVariant.schema === initialSchema) throw new Error(`No schema defined.`)
      if (currentVariant.defaultsProvider) throw new Error(`Defaults already defined.`)
      currentVariant.defaultsProvider = defaultsProvider
      return builder
    },
    done: () => {
      const symbol = Symbol(currentVariant.name)
      const controller = {
        ...currentVariant,
        _: {
          defaultsProvider: currentVariant.defaultsProvider,
        },
        create: (input?: object) => ({
          _tag: currentVariant.name,
          _: {
            symbol,
          },
          // TODO pass through zod validation
          ...applyDefaults(input ?? {}, currentVariant.defaultsProvider?.(input ?? {}) ?? {}),
        }),
        // TODO move into _
        symbol,
        //eslint-disable-next-line
        is$: (value: unknown) => is(value, symbol),
        is: (value: unknown) => is(value, symbol),
        decode: (value: string) => {
          if (!currentVariant.codec) throw new Error(`Codec not defined.`)
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

  const applyDefaults = (input: object, defaults: object) => {
    const input_ = { ...input }
    for (const entry of Object.entries(defaults)) {
      // @ts-expect-error dynammic
      // eslint-disable-next-line
      input_[entry[0]] = input_[entry[0]] === undefined ? entry[1] : input_[entry[0]]
    }
    return input_
  }

  // TODO
  // eslint-disable-next-line
  return builder as any
}
