import { SomeSchema } from '../../core/internal.js'
import { Encoder, StoredRecord, StoredRecords } from '../../core/types.js'
import { OmitRequired, Rest } from '../../lib/utils.js'
import { z } from '../../lib/z/index.js'
import { SomeDecodeOrThrowJson, SomeDecoderJson, SomeDefaultsProvider, SomeEncoderJson } from './internal.js'

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

type Decoders_<Obj, Names extends string[], V extends StoredRecord> = Names extends []
  ? Obj
  : Decoders_<Obj & DecoderMethods<Names[0], V>, Rest<Names>, V>

type DecoderMethods<Name extends string, V extends StoredRecord> = {
  [N in Name]: (value: string) => null | StoredRecord.GetType<V>
} & {
  [N in Name as `${N}OrThrow`]: (value: string) => StoredRecord.GetType<V>
}

// prettier-ignore
export type RecordController<Rs extends StoredRecords, V extends StoredRecord> = {
  _: {
    defaultsProvider: null extends V['defaults']
      ? null
      : SomeDefaultsProvider<object, Exclude<V['defaults'], null>>
    tag: string
    symbol: symbol
    codecs: [...string[]]
  }
  name: V[`name`]
  schema: StoredRecord.GetZodSchema<V>
  /**
   * Decoders for this record. Decoders are used to transform other representations of your record back into a record instance.
   */
  from: {
    /**
     * Decode JSON into this record. If it fails for any reason, returns `null`.
     *
     * @remarks This is a built in decoder.
     */
    json: (value: string) => null | StoredRecord.GetType<V>
    /**
     * Decode JSON into this record. Throws if it fails for any reason.
     *
     * @remarks This is a built in decoder.
     */
    jsonOrThrow: (value: string) => StoredRecord.GetType<V>
  } & Decoders<V['codec'], V>
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
    json: (record: StoredRecord.GetType<V>) => string
  } & Encoders<V['codec'], V>
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
  is(value: StoredRecords.Union<Rs>): value is StoredRecord.GetType<V>
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
  is$(value: unknown): value is StoredRecord.GetType<V>
} & (keyof GetConstructorInput<V> extends never
  ? {
      /**
       * TODO
       */
      create(): StoredRecord.GetType<V>
    }
  : keyof OmitRequired<GetConstructorInput<V>> extends never
  ? {
      /**
       * TODO
       */
      create(input?: GetConstructorInput<V>): StoredRecord.GetType<V>
    }
  : {
      /**
       * TODO
       */
      create(input: GetConstructorInput<V>): StoredRecord.GetType<V>
    }) &
  // (V[`codec`] extends true
  //   ? {
  //       /**
  //        * Serialize this record into a string representation.
  //        */
  //       encode: Encoder<V>
  //       /**
  //        * Deserialize a string representation of this record.
  //        */
  //       decode: Decoder<V>
  //       /**
  //        * Deserialize a string representation of this record.
  //        * @throws Error if decode fails.
  //        */
  //       decodeOrThrow: DecoderThatThrows<V>
  //     }
  //   : {
  //       /**
  //        * This method is not available. You have not defined a codec on this record.
  //        *
  //        * Define a codec on your record like this:
  //        *
  //        * ```ts
  //        * Alge
  //        *  .create('Foo')
  //        *  .record('Bar', {
  //        *    qux: z.string(),
  //        *  })
  //        *  .codec({
  //        *    encode: (data) => data.qux,
  //        *    decode: (data) => ({ qux: data }),
  //        *  })
  //        * ```
  //        */
  //       encode: never
  //       /**
  //        * This method is not available. You have not defined a codec on this record.
  //        *
  //        * Define a codec on your record like this:
  //        *
  //        * ```ts
  //        * Alge
  //        *  .create('Foo')
  //        *  .record('Bar', {
  //        *    qux: z.string(),
  //        *  })
  //        *  .codec({
  //        *    encode: (data) => data.qux,
  //        *    decode: (data) => ({ qux: data }),
  //        *  })
  //        * ```
  //        */
  //       decode: never
  //       /**
  //        * This method is not available. You have not defined a codec on this record.
  //        *
  //        * Define a codec on your record like this:
  //        *
  //        * ```ts
  //        * Alge
  //        *  .create('Foo')
  //        *  .record('Bar', {
  //        *    qux: z.string(),
  //        *  })
  //        *  .codec({
  //        *    encode: (data) => data.qux,
  //        *    decode: (data) => ({ qux: data }),
  //        *  })
  //        * ```
  //        */
  //       decodeOrThrow: never
  //     }) &
  V[`extensions`]

export type ApplyDefaults<Defaults, Input> = {
  [K in keyof Input as K extends keyof Defaults ? never : K]: Input[K]
} & {
  [K in keyof Input as K extends keyof Defaults ? K : never]?: Input[K]
}
