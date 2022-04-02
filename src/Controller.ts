import {
  Parse2,
  Parse2OrThrow,
  StoredVariantData,
  StoredVariantRecordBase,
  StoredVariantsBase,
} from './Builder'
import { IsUnknown } from './helpers'
import { z } from './lib/z'

export type GetADTMethods<Members extends StoredVariantsBase> = {
  schema: GetADTSchema<Members>
} & (IsAllMembersHaveParse<Members> extends true
  ? {
      parse: Parse2<z.TypeOf<GetADTSchema<Members>>>
      parseOrThrow: Parse2OrThrow<z.TypeOf<GetADTSchema<Members>>>
    }
  : {})

type IsAllMembersHaveParse<Members extends StoredVariantsBase> = {
  // @ts-expect-error adf
  [K in keyof Members]: IsUnknown<Members[K][1][`parse`]> extends true ? `missing` : never
} extends [never, ...never[]]
  ? true
  : false

type GetADTSchema<Members extends StoredVariantsBase> = z.ZodUnion<{
  // @ts-expect-error adf
  [K in keyof Members]: z.ZodObject<Members[K][1][`schema`]>
}>

export type GetVariantsNamespacedMethods<Vs extends StoredVariantRecordBase> = {
  [Name in keyof Vs]: VariantApi<Name, Vs[Name]>
}

// prettier-ignore
type VariantApi<Name, V extends StoredVariantData> =
  {
    name: Name
    schema: z.ZodObject<V[`schema`]>
    // TODO need access to the ADT
    // is(value: unknown): value is z.TypeOf<z.ZodObject<V[`schema`]>>
    isUnknown(value: unknown): value is z.TypeOf<z.ZodObject<V[`schema`]>>
  }
// & (
//   Record<string,unknown> extends z.TypeOf<z.Omit<z.ZodObject<Def[`schema`]>, { _tag: true }>>
//   ?
//     {
//       create(): z.TypeOf<z.ZodObject<Def[`schema`]>>
//     }
//   :
//     {
//       create(input: z.TypeOf<z.Omit<z.ZodObject<Def[`schema`]>, { _tag: true }>>): z.TypeOf<z.ZodObject<Def[`schema`]>>
//     }
//   )
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
