import { SomeSchema, SomeSchemaDef } from '../../core/internal.js'
import { Encoder, SomeName, StoredRecords } from '../../core/types.js'
import { OmitRequired, Rest } from '../../lib/utils.js'
import { z } from '../../lib/z/index.js'
import { SomeDecodeOrThrowJson, SomeDecoderJson, SomeDefaultsProvider, SomeEncoderJson } from './internal.js'
import { StoredRecord } from './StoredRecord.js'

export type GetConstructorInput<V extends StoredRecord> = ApplyDefaults<
  V['defaults'],
  z.TypeOf<z.Omit<StoredRecord.GetZodSchema<V>, { _tag: true }>>
>

export type SomeRecord = {
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
  // eslint-disable-next-line
  is: (value: any) => boolean
  is$: (value: unknown) => boolean
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
type Encoders<Names extends string[], V extends StoredRecord> = Encoders_<{}, Names, V>

type Encoders_<Obj, Names extends string[], V extends StoredRecord> = Names extends []
  ? Obj
  : Decoders_<Obj & Encoder_<Names[0], V>, Rest<Names>, V>

type Encoder_<Name extends string, V extends StoredRecord> = {
  [N in Name]: Encoder<V>
}

// eslint-disable-next-line
type Decoders<Names extends string[], V extends StoredRecord> = Decoders_<{}, Names, V>

type Decoders_<Obj, Names extends string[], R extends StoredRecord> = Names extends []
  ? Obj
  : Decoders_<Obj & DecoderMethods<Names[0], R>, Rest<Names>, R>

type DecoderMethods<Name extends string, R extends StoredRecord> = {
  [N in Name]: (value: string) => null | StoredRecord.GetType<R>
} & {
  [N in Name as `${N}OrThrow`]: (value: string) => StoredRecord.GetType<R>
}

export namespace RecordController {
  export type CreateFromSchema<Name extends SomeName, Schema extends SomeSchemaDef> = CreateFromStoredRecord<
    StoredRecord.AddSchemaDefinition<Schema, StoredRecord.Create<Name>>
  >

  export type CreateFromStoredRecord<R extends StoredRecord> = RecordController<[R], R>
}

// prettier-ignore
export type RecordController<Rs extends StoredRecords, R extends StoredRecord> = {
  _: {
    defaultsProvider: null extends R['defaults']
      ? null
      : SomeDefaultsProvider<object, Exclude<R['defaults'], null>>
    tag: string
    symbol: symbol
    codecs: [...string[]]
  }
  name: R[`name`]
  schema: StoredRecord.GetZodSchema<R>
  /**
   * Decoders for this record. Decoders are used to transform other representations of your record back into a record instance.
   */
  from: {
    /**
     * Decode JSON into this record. If it fails for any reason, returns `null`.
     *
     * @remarks This is a built in decoder.
     */
    json: (value: string) => null | StoredRecord.GetType<R>
    /**
     * Decode JSON into this record. Throws if it fails for any reason.
     *
     * @remarks This is a built in decoder.
     */
    jsonOrThrow: (value: string) => StoredRecord.GetType<R>
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
    json: (record: StoredRecord.GetType<R>) => string
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
  // TODO
  // @ts-expect-error TODO
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
} & (keyof GetConstructorInput<R> extends never
  ? {
      /**
       * TODO
       */
      create(): StoredRecord.GetType<R>
    }
  : keyof OmitRequired<GetConstructorInput<R>> extends never
  ? {
      /**
       * TODO
       */
      create(input?: GetConstructorInput<R>): StoredRecord.GetType<R>
    }
  : {
      /**
       * TODO
       */
      create(input: GetConstructorInput<R>): StoredRecord.GetType<R>
    }) &
  R[`extensions`]

export type ApplyDefaults<Defaults, Input> = {
  [K in keyof Input as K extends keyof Defaults ? never : K]: Input[K]
} & {
  [K in keyof Input as K extends keyof Defaults ? K : never]?: Input[K]
}
