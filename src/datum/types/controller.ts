import { Encoder, StoredVariant, StoredVariants } from '../../core/types.js'
import { OmitRequired, Rest } from '../../lib/utils.js'
import { z } from '../../lib/z/index.js'
import { SomeDecodeOrThrowJson, SomeDecoderJson, SomeDefaultsProvider, SomeEncoderJson } from './internal.js'

export type GetConstructorInput<V extends StoredVariant> = ApplyDefaults<
  V['defaults'],
  z.TypeOf<z.Omit<StoredVariant.GetZodSchema<V>, { _tag: true }>>
>

export type SomeDatum = {
  _tag: string
  _: {
    tag: string
  }
}

export type SomeSchema = z.SomeZodObject

export type SomeDatumController = {
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
type Encoders<Names extends string[], V extends StoredVariant> = Encoders_<{}, Names, V>

type Encoders_<Obj, Names extends string[], V extends StoredVariant> = Names extends []
  ? Obj
  : Decoders_<Obj & Encoder_<Names[0], V>, Rest<Names>, V>

type Encoder_<Name extends string, V extends StoredVariant> = {
  [N in Name]: Encoder<V>
}

// eslint-disable-next-line
type Decoders<Names extends string[], V extends StoredVariant> = Decoders_<{}, Names, V>

type Decoders_<Obj, Names extends string[], V extends StoredVariant> = Names extends []
  ? Obj
  : Decoders_<Obj & DecoderMethods<Names[0], V>, Rest<Names>, V>

type DecoderMethods<Name extends string, V extends StoredVariant> = {
  [N in Name]: (value: string) => null | StoredVariant.GetType<V>
} & {
  [N in Name as `${N}OrThrow`]: (value: string) => StoredVariant.GetType<V>
}

// prettier-ignore
export type DatumController<Vs extends StoredVariants, V extends StoredVariant> = {
  _: {
    defaultsProvider: null extends V['defaults']
      ? null
      : SomeDefaultsProvider<object, Exclude<V['defaults'], null>>
    tag: string
    symbol: symbol
    codecs: [...string[]]
  }
  name: V[`name`]
  schema: StoredVariant.GetZodSchema<V>
  /**
   * Decoders for this datum. Decoders are used to transform other representations of your datum back into an datum instance.
   */
  from: {
    /**
     * Decode JSON into this datum. If it fails for any reason, returns `null`.
     *
     * @remarks This is a built in decoder.
     */
    json: (value: string) => null | StoredVariant.GetType<V>
    /**
     * Decode JSON into this datum. Throws if it fails for any reason.
     *
     * @remarks This is a built in decoder.
     */
    jsonOrThrow: (value: string) => StoredVariant.GetType<V>
  } & Decoders<V['codec'], V>
  // & {
  //   [I in IndexKeys<V['codec']> as AsString<V['codec'][I]>]: Decoder<V['codec']>,V>
  // }
  /**
   * Encoders for this datum. Encoders are used to transform your datum into another representation.
   */
  to: {
    /**
     * Encode an instance of this datum into JSON.
     *
     * @remarks This is a built in encoder.
     */
    json: (datum: StoredVariant.GetType<V>) => string
  } & Encoders<V['codec'], V>
  /**
   * Strict predicate/type guard for this variant.
   *
   * Unlike `is$` this is typed to only accept variants of this ADT.
   *
   * Prefer this function over `is$` since it will catch more errors. For example if you
   * are writing code that you think is dealing with the ADT then this function would catch
   * the error of that not being the case.
   *
   * Use `is$` when you have to deal with situations where you know the value could not be an ADT variant, but might be.
   */
  // TODO
  // @ts-expect-error TODO
  is(value: StoredVariants.Union<Vs>): value is StoredVariant.GetType<V>
  /**
   * Loose predicate/type guard for this variant.
   *
   * Unlike `is` this is typed to accept any value, not just variants of this ADT.
   *
   * Use this when you have to deal with situations where you know the value could not be an ADT variant, but might be.
   *
   * Prefer `is` over this function since it will catch more errors. For example if you
   * are writing code that you think is dealing with the ADT then `is` would catch
   * the error of that not being the case while this function would not.
   */
  is$(value: unknown): value is StoredVariant.GetType<V>
} & (keyof GetConstructorInput<V> extends never
  ? {
      /**
       * TODO
       */
      create(): StoredVariant.GetType<V>
    }
  : keyof OmitRequired<GetConstructorInput<V>> extends never
  ? {
      /**
       * TODO
       */
      create(input?: GetConstructorInput<V>): StoredVariant.GetType<V>
    }
  : {
      /**
       * TODO
       */
      create(input: GetConstructorInput<V>): StoredVariant.GetType<V>
    }) &
  // (V[`codec`] extends true
  //   ? {
  //       /**
  //        * Serialize this variant into a string representation.
  //        */
  //       encode: Encoder<V>
  //       /**
  //        * Deserialize a string representation of this variant.
  //        */
  //       decode: Decoder<V>
  //       /**
  //        * Deserialize a string representation of this variant.
  //        * @throws Error if decode fails.
  //        */
  //       decodeOrThrow: DecoderThatThrows<V>
  //     }
  //   : {
  //       /**
  //        * This method is not available. You have not defined a codec on this variant.
  //        *
  //        * Define a codec on your variant like this:
  //        *
  //        * ```ts
  //        * Alge
  //        *  .create('Foo')
  //        *  .variant('Bar', {
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
  //        * This method is not available. You have not defined a codec on this variant.
  //        *
  //        * Define a codec on your variant like this:
  //        *
  //        * ```ts
  //        * Alge
  //        *  .create('Foo')
  //        *  .variant('Bar', {
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
  //        * This method is not available. You have not defined a codec on this variant.
  //        *
  //        * Define a codec on your variant like this:
  //        *
  //        * ```ts
  //        * Alge
  //        *  .create('Foo')
  //        *  .variant('Bar', {
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
