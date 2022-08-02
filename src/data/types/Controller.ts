import { StoredRecords } from '../../core/types.js'
import { RecordController } from '../../record/types/controller.js'
import { StoredADT } from './Builder.js'

// prettier-ignore
export type DataController<ADT extends StoredADT, Vs extends StoredRecords> =
  ADT &
  ADTMethods<Vs> &
  RecordsMethods<Vs>

/**
 * Build up the API on the ADT itself:
 *
 * ```ts
 * const A = Alge.create('A')...
 * // A.<...>  <-- Methods here
 * ```
 */
// prettier-ignore
type ADTMethods<Vs extends StoredRecords> = {
  schema: StoredRecords.ZodUnion<Vs>
  from: DecoderMethods<'json', Vs> & StoredRecords.GetAdtLevelDecoderMethods<Vs>
  to: EncoderMethods<'json', Vs> & StoredRecords.GetAdtLevelEncoderMethods<Vs>
}

/**
 * build up the API for each record defined in the ADT:
 *
 * ```ts
 * const A = Alge.create('A').record('B',...)...
 * // A.B.<...>  <-- Methods here
 * ```
 */
export type RecordsMethods<Vs extends StoredRecords> = {
  [V in Vs[number] as V[`name`]]: RecordController<Vs, V>
  // [V in Vs[number] as V[`name`]]: V['schema']
}

// Helpers
// -------

export type DecoderMethods<Name extends string, Rs extends StoredRecords> = {
  [N in Name]: (value: string) => null | StoredRecords.Union<Rs>
} & {
  [N in Name as `${N}OrThrow`]: (value: string) => StoredRecords.Union<Rs>
}

export type EncoderMethods<Name extends string, Vs extends StoredRecords> = {
  [N in Name]: Encoder<Vs>
}

export type Encoder<Vs extends StoredRecords> = (adt: StoredRecords.Union<Vs>) => string
