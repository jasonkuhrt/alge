import { is } from '../core/helpers'
import { ExtensionsBase } from '../core/types'
import {
  SomeADT,
  SomeCodecDefinition,
  SomeSchema,
  SomeVariant,
  SomeVariantDefinition,
} from '../core/typesInternal'
import { Errors } from '../Errors'
import { r } from '../lib/r'
import { code, isEmpty, TupleToObject } from '../lib/utils'
import { z } from '../lib/z'
import { Initial } from './types'

/**
 * Define an algebraic data type. There must be at least two members. If all members have a parse function then an ADT level parse function will automatically be derived.
 */
// @ts-expect-error empty init tuple
export const data = <Name extends string>(name: Name): Initial<{ name: Name }, []> => {
  let currentVariant: null | SomeVariantDefinition = null
  const variants: SomeVariantDefinition[] = []
  const builder = {
    variant: (nameOrVariant: string | SomeVariant) => {
      currentVariant =
        typeof nameOrVariant === `string`
          ? {
              name: nameOrVariant,
              schema: z.object({ _tag: z.literal(nameOrVariant) }),
              extensions: {},
              defaultsProvider: null,
            }
          : {
              name: nameOrVariant.name,
              schema: nameOrVariant.schema,
              defaultsProvider: nameOrVariant._.defaultsProvider,
              // codec: { encode: nameOrVariant.encode, decode: nameOrVariant.decode },
              extensions: nameOrVariant,
            }
      variants.push(currentVariant)
      return builder
    },
    schema: (schema: SomeSchema) => {
      if (!currentVariant) throw new Error(`Define variant first.`)
      currentVariant.schema = z.object({ ...schema, _tag: z.literal(currentVariant.name) })
      return builder
    },
    extend: (extensions: ExtensionsBase) => {
      if (!currentVariant) throw new Error(`Define variant first.`)
      currentVariant.extensions = {
        ...currentVariant.extensions,
        ...extensions,
      }
      return builder
    },
    codec: (codecDef: SomeCodecDefinition) => {
      if (!currentVariant) throw new Error(`Define variant first.`)
      if (currentVariant.codec) throw new Error(`Codec already defined.`)
      currentVariant.codec = codecDef
      return builder
    },
    done: () => {
      if (isEmpty(variants)) throw createEmptyVariantsError({ name })

      const variantApis = r.pipe(
        variants,
        r.map((v) => {
          const symbol = Symbol(v.name)
          const api = {
            ...v,
            create: (input?: object) => ({
              _tag: v.name,
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
              if (!v.codec) throw new Error(`Codec not implemented.`)
              const data = v.codec.decode(value, { ...v.extensions, schema: v.schema, name: v.name })
              if (data === null) return null
              // TODO
              // eslint-disable-next-line
              return api.create(data)
            },
            decodeOrThrow: (value: string) => {
              const data = api.decode(value)
              if (data === null) throw new Error(`Failed to decode value \`${value}\` into a ${name}.`)
              return data
            },
            encode: (variant: SomeVariant) => {
              if (!v.codec) throw new Error(`Codec not implemented.`)
              return v.codec.encode(variant)
            },
            ...v.extensions,
          }
          return api
        }),
        r.indexBy(r.prop(`name`))
      )

      const controller = {
        name,
        schema:
          variants.length >= 2
            ? z.union([
                // eslint-disable-next-line
                variants[0]!.schema,
                // eslint-disable-next-line
                variants[1]!.schema,
                ...variants.slice(2).map((_) => _.schema),
              ])
            : variants.length === 1
            ? // eslint-disable-next-line
              variants[0]!.schema
            : null,
        encode: (variant: SomeVariant) => {
          const variantsMissingCodecDef = variants.filter((v) => v.codec === undefined)
          if (variantsMissingCodecDef.length)
            throw new Error(
              `ADT level codec not available because some variants did not define a codec: ${variantsMissingCodecDef
                .map(r.prop(`name`))
                .join(`, `)}`
            )
          // TODO
          // eslint-disable-next-line
          const variantApi = variantApis[(variant as any)._tag]
          // TODO
          // eslint-disable-next-line
          if (!variantApi) throw new Error(`Failed to find Variant tagged ${(variant as any)._tag}`)
          return variantApi.encode(variant)
        },
        decode: (value: string) => {
          const variantsMissingCodecDef = variants.filter((v) => v.codec === undefined)
          if (variantsMissingCodecDef.length)
            throw new Error(
              `ADT level codec not available because some variants did not define a codec: ${variantsMissingCodecDef
                .map(r.prop(`name`))
                .join(`, `)}`
            )
          for (const variantApi of Object.values(variantApis)) {
            const result = variantApi.decode(value)
            if (result) return result
          }
          return null
        },
        decodeOrThrow: (value: string) => {
          const data = controller.decode(value)
          if (data === null)
            throw new Error(`Failed to decode value \`${value}\` into any of the variants for this ADT.`)
          return data
        },
        ...variantApis,
      }

      return controller
    },
  }

  // TODO
  // eslint-disable-next-line
  return builder as any
}

const createEmptyVariantsError = (params: { name: string }) =>
  Errors.UserMistake.create(
    `No variants defined for ADT ${code(params.name)} but ${code(
      `.done()`
    )} was called. You can only call ${code(
      `.done()`
    )} after your ADT has at least one variant defined (via ${code(`.variant()`)}).`
  )

export type Infer<ADT extends SomeADT> = {
  // eslint-ignore-next-line
  '*': z.infer<ADT['schema']>
} & TupleToObject<SchemaToTuple<ADT['schema']['_def']['options']>[number]>

export type SchemaToTuple<Schemas extends [z.SomeZodObject, ...z.SomeZodObject[]]> = {
  [Index in keyof Schemas]: [
    // @ts-expect-error TODO
    // z.TypeOf<ReturnType<Schemas[Index]['_def']['shape']>['_tag']>,
    z.TypeOf<Schemas[Index]>['_tag'],
    // @ts-expect-error TODO
    z.TypeOf<Schemas[Index]>
  ]
}
