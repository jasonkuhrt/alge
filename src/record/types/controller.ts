import { SomeSchema, SomeSchemaDef } from '../../core/internal.js'
import { Encoder, OmitTag, SomeName, StoredRecords } from '../../core/types.js'
import { OmitRequired, Rest } from '../../lib/utils.js'
import { z } from '../../lib/z/index.js'
import { SomeDecodeOrThrowJson, SomeDecoderJson, SomeDefaultsProvider, SomeEncoderJson } from './internal.js'
import { SomeStoredRecord, StoredRecord } from './StoredRecord.js'

export type SomeRecord = {
  _tag: string
}

export type SomeRecordInternal = {
  _tag: string
  _: {
    tag: string
  }
}

export type SomeRecordController = {
  _: {
    defaultsProvider: null | SomeDefaultsProvider
    codecs: [...string[]]
    symbol: symbol
  }
  name: string
  schema: SomeSchema
  // !! HACK not-using any here results in test type errors that I don't understand yet.
  // eslint-disable-next-line
  is: (record: any) => boolean
  is$: (value: unknown) => boolean
  // !! HACK not-using any here results in test type errors that I don't understand yet.
  // eslint-disable-next-line
  update: (record: any, changes: object) => object
  // eslint-disable-next-line
  create: (params?: any) => any
  from: {
    json: SomeDecoderJson
    jsonOrThrow: SomeDecodeOrThrowJson
  }
  to: {
    json: SomeEncoderJson
  }
}

// eslint-disable-next-line
type Encoders<Names extends string[], V extends SomeStoredRecord> = Encoders_<{}, Names, V>

type Encoders_<Obj, Names extends string[], V extends SomeStoredRecord> = Names extends []
  ? Obj
  : Encoders_<Obj & Encoder_<Names[0], V>, Rest<Names>, V>

type Encoder_<Name extends string, V extends SomeStoredRecord> = {
  [N in Name]: Encoder<V>
}

// eslint-disable-next-line
type Decoders<Names extends string[], V extends SomeStoredRecord> = Decoders_<{}, Names, V>

type Decoders_<Obj, Names extends string[], R extends SomeStoredRecord> = Names extends []
  ? Obj
  : Decoders_<Obj & DecoderMethods<Names[0], R>, Rest<Names>, R>

type DecoderMethods<Name extends string, R extends SomeStoredRecord> = {
  [N in Name]: (value: string) => null | StoredRecord.GetType<R>
} & {
  [N in Name as `${N}OrThrow`]: (value: string) => StoredRecord.GetType<R>
}

export namespace RecordController {
  export type CreateFromSchema<Name extends SomeName, Schema extends SomeSchema> = CreateFromStoredRecord<
    StoredRecord.AddSchema<Schema, StoredRecord.Create<Name>>
  >

  export type CreateFromSchemaDef<
    Name extends SomeName,
    SchemaDef extends SomeSchemaDef
  > = CreateFromStoredRecord<StoredRecord.AddSchemaDef<SchemaDef, StoredRecord.Create<Name>>>

  export type CreateFromStoredRecord<R extends SomeStoredRecord> = RecordController<[R], R>

  export type GetConstructorInput<V extends SomeStoredRecord> = ApplyDefaults<
    V['defaults'],
    z.input<z.Omit<V['schema'], { _tag: true }>>
  >
}

// prettier-ignore
export type RecordController<Rs extends StoredRecords, R extends SomeStoredRecord> = {
  _: {
    defaultsProvider: null extends R['defaults']
      ? null
      : SomeDefaultsProvider<object, Exclude<R['defaults'], null>>
    tag: string
    symbol: symbol
    codecs: [...string[]]
  }
  name: R[`name`]
  schema: R['schema']
  /**
   * 
   * @throws If zod schema violated: bad types, failed validation, throw from a transformer.
   */
  update(record: StoredRecord.GetType<R>, changes: Partial<OmitTag<StoredRecord.GetType<R>>>): StoredRecord.GetType<R>
  /**
   * Decoders for this record. Decoders are used to transform other representations of your record back into a record instance.
   */
  from: {
    /**
     * Decode JSON into this record. If it fails for any reason, returns `null`.
     *
     * @remarks This is a built in decoder.
     */
    json(value: string): null | StoredRecord.GetType<R>
    /**
     * Decode JSON into this record. Throws if it fails for any reason.
     *
     * @remarks This is a built in decoder.
     */
    jsonOrThrow(value: string): StoredRecord.GetType<R>
  } & Decoders<R['codec'], R>
  // & {
  //   [I in IndexKeys<V['codec']> as AsString<V['codec'][I]>]: Decoder<V['codec']>,V>
  // }
  /**
   * Encoders for this record. Encoders are used to transform your record into another representation.
   */
  to: {
    /**
     * Encode an instance of this record into JSON.
     *
     * @remarks This is a built in encoder.
     */
    json(record: StoredRecord.GetType<R>): string
  } & Encoders<R['codec'], R>
  /**
   * Strict predicate/type guard for this record.
   *
   * Unlike `is$` this is typed to only accept records of this ADT.
   *
   * Prefer this function over `is$` since it will catch more errors. For example if you
   * are writing code that you think is dealing with the ADT then this function would catch
   * the error of that not being the case.
   *
   * Use `is$` when you have to deal with situations where you know the value could not be an ADT record, but might be.
   */
  is(value: StoredRecords.Union<Rs>): value is StoredRecord.GetType<R>
  /**
   * Loose predicate/type guard for this record.
   *
   * Unlike `is` this is typed to accept any value, not just records of this ADT.
   *
   * Use this when you have to deal with situations where you know the value could not be an ADT record, but might be.
   *
   * Prefer `is` over this function since it will catch more errors. For example if you
   * are writing code that you think is dealing with the ADT then `is` would catch
   * the error of that not being the case while this function would not.
   */
  is$(value: unknown): value is StoredRecord.GetType<R>
} & (keyof RecordController.GetConstructorInput<R> extends never
  ? {
      /**
       * TODO
       */
      create(): StoredRecord.GetType<R>
    }
  : keyof OmitRequired<RecordController.GetConstructorInput<R>> extends never
  ? {
      /**
       * TODO
       */
      create(input?: RecordController.GetConstructorInput<R>): StoredRecord.GetType<R>
    }
  : {
      /**
       * TODO
       */
      create(input: RecordController.GetConstructorInput<R>): StoredRecord.GetType<R>
    }) &
  R[`extensions`]

export type ApplyDefaults<Defaults, Input> = {
  [K in keyof Input as K extends keyof Defaults ? never : K]: Input[K]
} & {
  [K in keyof Input as K extends keyof Defaults ? K : never]?: Input[K]
}
