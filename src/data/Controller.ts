import { ADTDecoder, ADTEncoder, StoredVariant, StoredVariants } from '../core/types'
import { Datum } from '../datum/controller'
import { z } from '../lib/z'
import { StoredADT } from './types'

export type Controller<ADT extends StoredADT, Vs extends StoredVariants> = ADT &
  ADTMethods<Vs> &
  VariantsNamespacedMethods<Vs>

/**
 * Build up the API on the ADT itself:
 *
 * ```ts
 * const A = Alge.create('A')...
 * // A.<...>  <-- Methods here
 * ```
 */
// prettier-ignore
type ADTMethods<Vs extends StoredVariants> = {
  schema: StoredVariants.ZodUnion<Vs>
} & (StoredVariants.IsAllHaveCodec<Vs> extends true
  ? {
      encode: ADTEncoder<Vs>
      decode: ADTDecoder<Vs>
      decodeOrThrow: ADTDecoder<Vs>
    }
  : {
      /**
       * TODO Useful JSDoc about why this is never
       */
      encode: never
      /**
       * TODO Useful JSDoc about why this is never
       */
      decode: never
      /**
       * TODO Useful JSDoc about why this is never
       */
      decodeOrThrow: never
    })

/**
 * build up the API for each variant defined in the ADT:
 *
 * ```ts
 * const A = Alge.create('A').variant('B',...)...
 * // A.B.<...>  <-- Methods here
 * ```
 */
export type VariantsNamespacedMethods<Vs extends StoredVariants> = {
  [V in Vs[number] as V[`name`]]: Datum<Vs, V>
}

export type GetConstructorInput<V extends StoredVariant> = z.TypeOf<
  z.Omit<StoredVariant.GetZodSchema<V>, { _tag: true }>
>
