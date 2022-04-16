import { Decoder, Encoder, Parse2, Parse2OrThrow, StoredADT, StoredVariant, StoredVariants } from './Builder'
import { IsUnknown, OmitRequired } from './lib/utils'
import { z } from './lib/z'

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
type ADTMethods<Vs extends StoredVariants> = {
  schema: StoredVariants.ZodUnion<Vs>
} & (IsAllMembersHaveParse<Vs> extends true
  ? {
      parse: Parse2<StoredVariants.Union<Vs>>
      parseOrThrow: Parse2OrThrow<StoredVariants.Union<Vs>>
    }
  : // TODO
    // eslint-disable-next-line
    {})

type IsAllMembersHaveParse<Vs extends StoredVariants> = {
  // @ts-expect-error adf
  [K in keyof Vs]: IsUnknown<Vs[K][1][`parse`]> extends true ? `missing` : never
} extends [never, ...never[]]
  ? true
  : false

/**
 * build up the API for each variant defined in the ADT:
 *
 * ```ts
 * const A = Alge.create('A').variant('B',...)...
 * // A.B.<...>  <-- Methods here
 * ```
 */
export type VariantsNamespacedMethods<Vs extends StoredVariants> = {
  [V in Vs[number] as V[`name`]]: VariantApi<Vs, V>
}

// prettier-ignore
type VariantApi<Vs extends StoredVariants, V extends StoredVariant> = {
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
      })
// & (
//   IsUnknown<Def[`parse`]> extends true
//     ?
//       {}
//     :
//       {
//         parse: Def[`parse`]
//         parseOrThrow: Parse2OrThrow<z.TypeOf<z.ZodObject<Def[`schema`]>>>
//       }
// )

// & Def[`extensions`]

export type GetConstructorInput<V extends StoredVariant> = z.TypeOf<
  z.Omit<StoredVariant.GetZodSchema<V>, { _tag: true }>
>
