import {
  Parse2,
  Parse2OrThrow,
  StoredVariantData,
  StoredVariantRecordBase,
  StoredVariantsBase,
} from './Builder'
import { IsUnknown, TupleToObject } from './lib/utils'
import { z } from './lib/z'
import { ZodRawShape, ZodSchema } from 'zod'

export type GetADTMethods<Vs extends StoredVariantsBase> = {
  schema: GetADTSchema<Vs>
} & (IsAllMembersHaveParse<Vs> extends true
  ? {
      parse: Parse2<z.TypeOf<GetADTSchema<Vs>>>
      parseOrThrow: Parse2OrThrow<z.TypeOf<GetADTSchema<Vs>>>
    }
  : // TODO
    // eslint-disable-next-line
    {})

type IsAllMembersHaveParse<Vs extends StoredVariantsBase> = {
  // @ts-expect-error adf
  [K in keyof Vs]: IsUnknown<Vs[K][1][`parse`]> extends true ? `missing` : never
} extends [never, ...never[]]
  ? true
  : false

type GetADTSchema<Members extends StoredVariantsBase> = z.ZodUnion<{
  // @ts-expect-error adf
  [K in keyof Members]: z.ZodObject<Members[K][1][`schema`]>
}>

export type GetVariantsNamespacedMethods<Vs extends StoredVariantsBase> = GetVariantsNamespacedMethods_<
  Vs,
  TupleToObject<Vs[number]>
>

export type GetVariantsNamespacedMethods_<
  Vs extends StoredVariantsBase,
  VsRec extends StoredVariantRecordBase
> = {
  [Name in keyof VsRec]: VariantApi<Vs, Name, VsRec[Name]>
}

// prettier-ignore
type VariantApi<Vs extends StoredVariantsBase, Name, V extends StoredVariantData> = {
  name: Name
  symbol: symbol
  schema: z.ZodObject<V[`schema`]>
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
  is(value: z.TypeOf<GetADTSchema<Vs>>): value is z.TypeOf<z.ZodObject<V[`schema`]>>
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
   *
   */
  is$(value: unknown): value is z.TypeOf<z.ZodObject<V[`schema`]>>
} &
(
  keyof GetInput<V[`schema`]> extends never
  ? {
      create(): GetOutput<V[`schema`]>
    }
  : keyof OmitRequired<GetInput<V[`schema`]>> extends never
  ? {
      create(input?: GetInput<V[`schema`]>): z.TypeOf<z.ZodObject<V[`schema`]>>
    }
  : {
      create(input: GetInput<V[`schema`]>): z.TypeOf<z.ZodObject<V[`schema`]>>
    }
)
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

type OmitRequired<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K]
}

type y = OmitRequired<{ a: 1; b?: 2 }>

type GetInput<Schema extends ZodRawShape> = z.TypeOf<z.Omit<z.ZodObject<Schema>, { _tag: true }>>

type GetOutput<Schema extends ZodRawShape> = z.TypeOf<z.ZodObject<Schema>>

type SomeRecord = Record<string, unknown>

type HasInput = keyof {}
type x = never extends never ? `a` : `b`
