import { ExtensionsBase, Initial, StoredVariant } from './Builder'
import { Errors } from './Errors'
import { is } from './helpers'
import { r } from './lib/r'
import { code, isEmpty, TupleToObject } from './lib/utils'
import { z } from './lib/z'

type SomeVariant = object

type SomeVariantConstructorInput = Record<string, unknown>

type SomeCodecDefinition = {
  encode: SomeEncoderDefinition
  decode: SomeDecoderDefinition
}

type SomeEncoderDefinition = (variant: SomeVariant) => string

type SomeVariantSchema = z.SomeZodObject

type SomeDecoderDefinition = (
  encodedData: string,
  extensions: { schema: SomeVariantSchema; name: string; [key: string]: unknown }
) => null | SomeVariantConstructorInput

type SomeVariantDefinition = Omit<StoredVariant, 'codec' | 'schema'> & {
  codec?: SomeCodecDefinition
  schema: z.SomeZodObject
}

type SomeADT = {
  name: string
  schema: SomeZodADT
}

type SomeZodADT = z.ZodUnion<[z.SomeZodObject, ...z.SomeZodObject[]]>
type SomeSchema = Record<string, z.ZodType<unknown>>

/**
 * Define an algebraic data type. There must be at least two members. If all members have a parse function then an ADT level parse function will automatically be derived.
 */
// @ts-expect-error empty init tuple
export const data = <Name extends string>(name: Name): Initial<{ name: Name }, []> => {
  let currentVariant: null | SomeVariantDefinition = null
  const variants: SomeVariantDefinition[] = []

  const api = {
    variant: (name: string) => {
      currentVariant = {
        name,
        schema: z.object({ _tag: z.literal(name) }),
        extensions: {},
      }
      variants.push(currentVariant)
      return api
    },
    schema: (schema: SomeSchema) => {
      if (!currentVariant) throw new Error(`Define variant first.`)
      currentVariant.schema = z.object({ ...schema, _tag: z.literal(currentVariant.name) })
      return api
    },
    extend: (extensions: ExtensionsBase) => {
      if (!currentVariant) throw new Error(`Define variant first.`)
      currentVariant.extensions = {
        ...currentVariant.extensions,
        ...extensions,
      }
      return api
    },
    codec: (codecDef: SomeCodecDefinition) => {
      if (!currentVariant) throw new Error(`Define variant first.`)
      if (currentVariant.codec) throw new Error(`Codec already defined.`)
      currentVariant.codec = codecDef
      return api
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
            encode: (variant: object) => {
              if (!v.codec) throw new Error(`Codec not implemented.`)
              return v.codec.encode(variant)
            },
            ...v.extensions,
          }
          return api
        }),
        r.indexBy(r.prop(`name`))
      )

      const adtApi = {
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
        encode: (variant: object) => {
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
          const data = adtApi.decode(value)
          if (data === null)
            throw new Error(`Failed to decode value \`${value}\` into any of the variants for this ADT.`)
          return data
        },
        ...variantApis,
      }

      return adtApi
    },
  }

  // TODO
  // eslint-disable-next-line
  return api as any
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
