import { is } from '../core/helpers.js'
import { ExtensionsBase } from '../core/types.js'
import { applyDefaults, extendChain, tryOrNull } from '../lib/utils.js'
import { z } from '../lib/z/index.js'
import { Initial } from './types/builder.js'
import { SomeDatumController } from './types/controller.js'
import {
  SomeCodecDefinition,
  SomeDatumConstructorInput,
  SomeDatumDefinition,
  SomeDefaultsProvider,
  SomeSchema,
} from './types/internal.js'

export const datum = <Name extends string>(
  name: Name,
  _: {
    extensions?: object
    extend?: SomeDatumController
  } = {}
): Initial<Name> => {
  const chainTerminus = `done`
  const initialSchema = z.object({ _tag: z.literal(name) })
  const current: SomeDatumDefinition = {
    name,
    schema: initialSchema,
    extensions: {},
    defaultsProvider: null,
    codec: undefined,
    ...(_.extend
      ? {
          name: _.extend.name,
          schema: _.extend.schema,
          defaultsProvider: _.extend._.defaultsProvider,
          codec: _.extend._.codec,
          extensions: _.extend,
        }
      : {}),
  }

  const chain = {
    schema: (schema: SomeSchema) => {
      current.schema = z.object({ ...schema, _tag: z.literal(current.name) })
      return chain
    },
    extend: (extensions: ExtensionsBase) => {
      current.extensions = {
        ...current.extensions,
        ...extensions,
      }
      return chain
    },
    codec: (codecDef: SomeCodecDefinition) => {
      if (current.codec) throw new Error(`Codec already defined.`)
      current.codec = codecDef
      return chain
    },
    defaults: (defaultsProvider: SomeDefaultsProvider) => {
      if (current.schema === initialSchema) throw new Error(`No schema defined.`)
      if (current.defaultsProvider) throw new Error(`Defaults already defined.`)
      current.defaultsProvider = defaultsProvider
      return chain
    },
    done: () => {
      const symbol = Symbol(current.name)
      const controller: SomeDatumController = {
        ...current,
        _: {
          symbol,
          codec: current.codec,
          defaultsProvider: current.defaultsProvider,
        },
        create: (input: SomeDatumConstructorInput) => ({
          // TODO pass through zod validation
          ...applyDefaults(input ?? {}, current.defaultsProvider?.(input ?? {}) ?? {}),
          _tag: current.name,
          _: {
            symbol,
            tag: current.name,
          },
        }),
        //eslint-disable-next-line
        is$: (value: unknown) => is(value, symbol),
        is: (value: unknown) => is(value, symbol),
        from: {
          json: (json: string) => {
            const data = tryOrNull(() => JSON.parse(json) as object)
            if (data === null || typeof data !== `object`) return null
            // TODO
            // eslint-disable-next-line
            return controller.create(data)
          },
          jsonOrThrow: (json) => {
            const data = controller.from.json(json)
            if (data === null) throw new Error(`Failed to decode value \`${json}\` into a ${name}.`)
            return data
          },
        },
        to: {
          json: (data) => {
            return JSON.stringify(data)
          },
        },
        decode: (value: string) => {
          if (!current.codec) throw new Error(`Codec not defined.`)
          const data = current.codec.decode(value, {
            ...current.extensions,
            schema: current.schema,
            name: current.name,
          })
          if (data === null) return null
          // TODO
          // eslint-disable-next-line
          return controller.create(data)
        },
        decodeOrThrow: (value) => {
          const data = controller.decode(value)
          if (data === null) throw new Error(`Failed to decode value \`${value}\` into a ${name}.`)
          return data
        },
        encode: (variant: SomeDatumController) => {
          if (!current.codec) throw new Error(`Codec not implemented.`)
          return current.codec.encode(variant)
        },
        ...current.extensions,
      }
      return controller
    },
  }

  const chainWrapped = _.extensions
    ? extendChain({
        chain: {
          terminus: chainTerminus,
          // TODO
          // @ts-expect-error something about chain not having an index signature.
          methods: chain,
        },
        extensions: _.extensions,
      })
    : chain

  // TODO
  // eslint-disable-next-line
  return chainWrapped as any
}
