import { StoredVariants } from '../../core/types.js'
import { DatumController } from '../../datum/types/controller.js'
import { StoredADT } from './Builder.js'

// prettier-ignore
export type DataController<ADT extends StoredADT, Vs extends StoredVariants> =
  ADT &
  ADTMethods<Vs> &
  VariantsMethods<Vs>

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
} & { 
  from: DecoderMethods<'json', Vs>
  to: EncoderMethods<'json', Vs>
}

/**
 * build up the API for each variant defined in the ADT:
 *
 * ```ts
 * const A = Alge.create('A').variant('B',...)...
 * // A.B.<...>  <-- Methods here
 * ```
 */
export type VariantsMethods<Vs extends StoredVariants> = {
  [V in Vs[number] as V[`name`]]: DatumController<Vs, V>
  // [V in Vs[number] as V[`name`]]: V['schema']
}

// Helpers
// -------

export type DecoderMethods<Name extends string, Vs extends StoredVariants> = {
  [N in Name]: (value: string) => null | StoredVariants.Union<Vs>
} & {
  [N in Name as `${N}OrThrow`]: (value: string) => StoredVariants.Union<Vs>
}

type EncoderMethods<Name extends string, Vs extends StoredVariants> = {
  [N in Name]: Encoder<Vs>
}

export type Encoder<Vs extends StoredVariants> = (adt: StoredVariants.Union<Vs>) => string
