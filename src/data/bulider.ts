import { Errors } from '../Errors'
import { r } from '../lib/r'
import { code, isEmpty, TupleToObject } from '../lib/utils'
import { z } from '../lib/z'
import { Initial } from './types'
import { SomeADT } from './typesInternal'
import { SomeDatum, SomeDatumController } from '~/datum/types/controller'
import { SomeDatumBuilder, SomeDecodeOrThrower, SomeDecoder, SomeEncoder } from '~/datum/types/internal'
import { datum } from '~/index_'
import { SomeZodObject } from 'zod'

export type SomeData = {
  name: string
  schema: null | SomeZodObject | z.ZodUnion<[z.SomeZodObject, ...z.SomeZodObject[]]>
  encode: SomeEncoder
  decode: SomeDecoder
  decodeOrThrow: SomeDecodeOrThrower
}

/**
 * Define an algebraic data type. There must be at least two members. If all members have a parse function then an ADT level parse function will automatically be derived.
 */
// @ts-expect-error empty init tuple
export const data = <Name extends string>(name: Name): Initial<{ name: Name }, []> => {
  // let currentVariant: null | SomeVariantDefinition = null
  // const variants: SomeVariantDefinition[] = []
  let currentDatumBuilder: null | SomeDatumBuilder = null
  const datums: SomeDatumController[] = []
  const builder = {
    variant: (nameOrDatum: string | SomeDatumController) => {
      if (currentDatumBuilder?._) datums.push(currentDatumBuilder._.innerChain.done() as SomeDatumController)
      currentDatumBuilder =
        typeof nameOrDatum === `string`
          ? (datum(nameOrDatum, {
              extensions: builder,
            }) as SomeDatumBuilder)
          : (datum(nameOrDatum.name, {
              extensions: builder,
              extend: nameOrDatum,
            }) as SomeDatumBuilder)
      return currentDatumBuilder
    },
    done: () => {
      if (currentDatumBuilder?._) datums.push(currentDatumBuilder._.innerChain.done() as SomeDatumController)
      if (isEmpty(datums)) throw createEmptyVariantsError({ name })

      const datumsApi = r.pipe(datums, r.indexBy(r.prop(`name`)))

      const ADTApi: SomeData = {
        name,
        schema:
          datums.length >= 2
            ? z.union([
                // eslint-disable-next-line
                datums[0]!.schema,
                // eslint-disable-next-line
                datums[1]!.schema,
                ...datums.slice(2).map((_) => _.schema),
              ])
            : datums.length === 1
            ? // eslint-disable-next-line
              datums[0]!.schema
            : null,
        encode: (someDatum: SomeDatum) => {
          const missingCodecDef = datums.filter((d) => d._.codec === undefined)
          if (missingCodecDef.length)
            throw new Error(
              `ADT level codec not available because some variants did not define a codec: ${missingCodecDef
                .map(r.prop(`name`))
                .join(`, `)}`
            )
          const datum = datumsApi[someDatum._tag]
          if (!datum) throw new Error(`Failed to find Variant tagged ${someDatum._tag}`)
          return datum.encode(someDatum, { schema: datum.schema })
        },
        decode: (value) => {
          const variantsMissingCodecDef = datums.filter((d) => d._.codec === undefined)
          if (variantsMissingCodecDef.length)
            throw new Error(
              `ADT level codec not available because some variants did not define a codec: ${variantsMissingCodecDef
                .map(r.prop(`name`))
                .join(`, `)}`
            )
          for (const datumApi of Object.values(datumsApi)) {
            const result = datumApi.decode(value)
            if (result) return result
          }
          return null
        },
        decodeOrThrow: (value) => {
          const data = ADTApi.decode(value)
          if (data === null)
            throw new Error(`Failed to decode value \`${value}\` into any of the variants for this ADT.`)
          return data
        },
      }

      const controller = {
        ...ADTApi,
        ...datumsApi,
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
  [Index in keyof Schemas]: [z.TypeOf<Schemas[Index]>['_tag'], z.TypeOf<Schemas[Index]>]
}
