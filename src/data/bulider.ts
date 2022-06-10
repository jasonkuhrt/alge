import { SomeADT } from '../core/typesInternal'
import { Errors } from '../Errors'
import { r } from '../lib/r'
import { code, isEmpty, TupleToObject } from '../lib/utils'
import { z } from '../lib/z'
import { Initial } from './types'
import { SomeDatum } from '~/datum/controller'
import { SomeDatumBuilder } from '~/datum/types'
import { datum } from '~/index_'

/**
 * Define an algebraic data type. There must be at least two members. If all members have a parse function then an ADT level parse function will automatically be derived.
 */
// @ts-expect-error empty init tuple
export const data = <Name extends string>(name: Name): Initial<{ name: Name }, []> => {
  // let currentVariant: null | SomeVariantDefinition = null
  // const variants: SomeVariantDefinition[] = []
  let currentDatumBuilder: null | SomeDatumBuilder = null
  const datums: SomeDatum[] = []
  const builder = {
    variant: (nameOrVariant: string | SomeDatum) => {
      if (currentDatumBuilder?._) datums.push(currentDatumBuilder._.innerChain.done() as SomeDatum)
      currentDatumBuilder =
        typeof nameOrVariant === `string`
          ? (datum(nameOrVariant, {
              extensions: builder,
            }) as SomeDatumBuilder)
          : (datum(nameOrVariant.name, {
              extensions: builder,
              extend: nameOrVariant,
            }) as SomeDatumBuilder)
      return currentDatumBuilder
    },
    done: () => {
      if (currentDatumBuilder?._) datums.push(currentDatumBuilder._.innerChain.done() as SomeDatum)
      if (isEmpty(datums)) throw createEmptyVariantsError({ name })

      const datumsLookup = r.pipe(datums, r.indexBy(r.prop(`name`)))

      const controller = {
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
          const variantsMissingCodecDef = datums.filter((d) => d._.codec === undefined)
          if (variantsMissingCodecDef.length)
            throw new Error(
              `ADT level codec not available because some variants did not define a codec: ${variantsMissingCodecDef
                .map(r.prop(`name`))
                .join(`, `)}`
            )
          // TODO
          // eslint-disable-next-line
          const datum = datumsLookup[(someDatum as any)._tag]
          // TODO
          // eslint-disable-next-line
          if (!datum) throw new Error(`Failed to find Variant tagged ${(someDatum as any)._tag}`)
          return datum.encode(someDatum, { schema: datum.schema })
        },
        decode: (value: string) => {
          const variantsMissingCodecDef = datums.filter((d) => d._.codec === undefined)
          if (variantsMissingCodecDef.length)
            throw new Error(
              `ADT level codec not available because some variants did not define a codec: ${variantsMissingCodecDef
                .map(r.prop(`name`))
                .join(`, `)}`
            )
          for (const variantApi of Object.values(datumsLookup)) {
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
        ...datumsLookup,
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
