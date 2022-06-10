import {
  Decoder,
  DecoderThatThrows,
  Encoder,
  SomeDecoder,
  SomeEncoder,
  StoredVariant,
  StoredVariants,
} from '~/core/types'
import { SomeCodecDefinition, SomeDefaultsProvider } from '~/core/typesInternal'
import { GetConstructorInput } from '~/data/Controller'
import { OmitRequired } from '~/lib/utils'
import { z } from 'zod'

export type SomeDatum = {
  _: {
    defaultsProvider: null | SomeDefaultsProvider
    codec?: SomeCodecDefinition
  }
  name: string
  symbol: symbol
  schema: z.SomeZodObject
  // eslint-disable-next-line
  is: (value: any) => boolean
  is$: (value: unknown) => boolean
  // eslint-disable-next-line
  create: (params: any) => any
  encode: SomeEncoder
  decode: SomeDecoder
}

// prettier-ignore
export type Datum<Vs extends StoredVariants, V extends StoredVariant> = {
  _: {
    defaultsProvider: null extends V['defaults'] ? null : SomeDefaultsProvider<object,Exclude<V['defaults'],null>>
  }
  name: V[`name`]
  symbol: symbol
  schema: StoredVariant.GetZodSchema<V>
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
  (V[`codec`] extends true
    ? {
        /**
         * Serialize this variant into a string representation.
         */
        encode: Encoder<V>
        /**
         * Deserialize a string representation of this variant.
         */
        decode: Decoder<V>
        /**
         * Deserialize a string representation of this variant.
         * @throws Error if decode fails.
         */
        decodeOrThrow: DecoderThatThrows<V>

      }
    : {
        /**
         * This method is not available. You have not defined a codec on this variant.
         *
         * Define a codec on your variant like this:
         *
         * ```ts
         * Alge
         *  .create('Foo')
         *  .variant('Bar', {
         *    qux: z.string(),
         *  })
         *  .codec({
         *    encode: (data) => data.qux,
         *    decode: (data) => ({ qux: data }),
         *  })
         * ```
         */
        encode: never
        /**
         * This method is not available. You have not defined a codec on this variant.
         *
         * Define a codec on your variant like this:
         *
         * ```ts
         * Alge
         *  .create('Foo')
         *  .variant('Bar', {
         *    qux: z.string(),
         *  })
         *  .codec({
         *    encode: (data) => data.qux,
         *    decode: (data) => ({ qux: data }),
         *  })
         * ```
         */
        decode: never
        /**
         * This method is not available. You have not defined a codec on this variant.
         *
         * Define a codec on your variant like this:
         *
         * ```ts
         * Alge
         *  .create('Foo')
         *  .variant('Bar', {
         *    qux: z.string(),
         *  })
         *  .codec({
         *    encode: (data) => data.qux,
         *    decode: (data) => ({ qux: data }),
         *  })
         * ```
         */
        decodeOrThrow: never
      }) &
      (V[`extensions`])
