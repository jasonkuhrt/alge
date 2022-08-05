import { SomeSchema, SomeSchemaDef } from '../../core/internal.js'
import { SomeName, StoredRecords } from '../../core/types.js'
import { ObjectValues, OnlyStrings } from '../../lib/utils.js'
import { RecordController } from '../../record/types/controller.js'
import { StoredRecord } from '../../record/types/StoredRecord.js'
import { StoredADT } from './Builder.js'

export type SomeShortHandRecordSchemaDefs = Record<string, SomeSchemaDef>

export type SomeShortHandRecordSchemas = Record<string, SomeSchema>

// eslint-disable-next-line
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

// eslint-disable-next-line
type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never

// eslint-disable-next-line
type Push<T extends any[], V> = [...T, V]

// TS4.1+
type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : Push<TuplifyUnion<Exclude<T, L>>, L>

export namespace DataController {
  export type createFromShortHandRecordSchemas<
    Name extends SomeName,
    shortHandRecordDefs extends SomeShortHandRecordSchemas
  > = DataController<StoredADT.Create<Name>, StoredRecordsFromShortHandRecordSchemas<shortHandRecordDefs>>

  type StoredRecordsFromShortHandRecordSchemas<shortHandRecordDefs extends SomeShortHandRecordSchemas> =
    OnlyStoredRecords<
      TuplifyUnion<
        ObjectValues<{
          [Name in OnlyStrings<keyof shortHandRecordDefs>]: StoredRecord.AddSchema<
            shortHandRecordDefs[Name],
            StoredRecord.Create<Name>
          >
        }>
      >
    >

  export type createFromShortHandRecordSchemaDefs<
    Name extends SomeName,
    shortHandRecordDefs extends SomeShortHandRecordSchemaDefs
  > = DataController<StoredADT.Create<Name>, StoredRecordsFromShortHandRecordSchemaDefs<shortHandRecordDefs>>

  // type x = StoredRecordsFromShortHandRecordDefs<{ a: { n: z.ZodString }; b: { m: z.ZodString } }>

  type StoredRecordsFromShortHandRecordSchemaDefs<shortHandRecordDefs extends SomeShortHandRecordSchemaDefs> =
    OnlyStoredRecords<
      TuplifyUnion<
        ObjectValues<{
          [Name in OnlyStrings<keyof shortHandRecordDefs>]: StoredRecord.AddSchemaDef<
            shortHandRecordDefs[Name],
            StoredRecord.Create<Name>
          >
        }>
      >
    >

  type OnlyStoredRecords<t> = t extends StoredRecords ? t : never
}

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
