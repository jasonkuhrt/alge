import { datum } from '../datum/runtime.js'
import { SomeDatum, SomeDatumController } from '../datum/types/controller.js'
import { SomeDatumBuilder, SomeDecodeOrThrower, SomeDecoder, SomeEncoder } from '../datum/types/internal.js'
import { Errors } from '../Errors/index.js'
import { r } from '../lib/r.js'
import { code, isEmpty, TupleToObject } from '../lib/utils.js'
import { z } from '../lib/z/index.js'
import { Initial } from './types/Builder.js'
import { SomeADT } from './types/internal.js'
import { inspect } from 'util'
import { SomeZodObject } from 'zod'

export type SomeAdtMethods = {
  name: string
  schema: null | SomeZodObject | z.ZodUnion<[z.SomeZodObject, ...z.SomeZodObject[]]>
  from: Record<string, SomeDecoder | SomeDecodeOrThrower>
  to: Record<string, SomeEncoder>
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

      const datumsMethods = r.pipe(datums, r.indexBy(r.prop(`name`)))

      // Get the common codecs. We only need to iterate from the point of view of one
      // datum's codecs, so we'll pick the first. We're guaranteed to have at least
      // one variant based on the empty check above.
      // eslint-disable-next-line
      const firstDatum = datums[0]!
      const commonCodecs = firstDatum._.codecs.filter(
        (codec) => datums.length === datums.filter((datum) => datum._.codecs.includes(codec)).length
      )

      const createAdtDecoderMethods = (codec: string): Record<string, SomeDecoder | SomeDecodeOrThrower> => {
        const methods: Record<string, SomeDecoder | SomeDecodeOrThrower> = {
          [codec]: (string: string) => {
            for (const datumMethods of Object.values(datumsMethods)) {
              // @ts-expect-error todo
              // eslint-disable-next-line
              const result = datumMethods.from[codec](string) as object
              if (result) return result
            }
            return null
          },
          [`${codec}OrThrow`]: (string: string) => {
            // @ts-expect-error We know the codec will be there because we defined it above.
            //eslint-disable-next-line
            const data = methods[codec](string) as object | null
            if (data === null)
              throw new Error(
                `Failed to decode value \`${inspect(string)}\` into any of the variants for this ADT.`
              )
            return data
          },
        }
        return methods
      }

      const createAdtEncoderMethods = (codec: string): Record<string, SomeEncoder> => {
        const methods = {
          [codec]: (data: SomeDatum) => {
            for (const datumMethods of Object.values(datumsMethods)) {
              // @ts-expect-error todo
              // eslint-disable-next-line
              if (data._tag === datumMethods.name) return datumMethods.to[codec](data)
            }
            throw new Error(`Failed to find an encoder for data: "${inspect(data)}"`)
          },
        }
        return methods
      }

      const ADTMethods: SomeAdtMethods = {
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
        from: {
          ...createAdtDecoderMethods(`json`),
          ...commonCodecs.reduce(
            (decoderMethods, codec) => ({ ...decoderMethods, ...createAdtDecoderMethods(codec) }),
            {} as Record<string, SomeDecoder>
          ),
        },
        to: {
          ...createAdtEncoderMethods(`json`),
          ...commonCodecs.reduce(
            (encoderMethods, codec) => ({ ...encoderMethods, ...createAdtEncoderMethods(codec) }),
            {} as Record<string, SomeEncoder>
          ),
        },
      }

      const controller = {
        ...ADTMethods,
        ...datumsMethods,
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

export type InferDatum<Datum extends SomeDatumController> = z.infer<Datum['schema']>

export type SchemaToTuple<Schemas extends [z.SomeZodObject, ...z.SomeZodObject[]]> = {
  [Index in keyof Schemas]: [z.TypeOf<Schemas[Index]>['_tag'], z.TypeOf<Schemas[Index]>]
}
