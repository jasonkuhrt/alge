import { IsUnknown, TupleToObject } from './helpers'
import { ZodOmit } from './ZodPlus'
import { z } from 'zod'

export type SchemaBase = Record<string, z.ZodType<unknown>>

export type ExtensionsBase = Record<string, unknown>

export interface VariantBuilder<ADT, StoredVariants extends StoredVariantsBase> {
  variant<
    Name extends string,
    Schema extends SchemaBase,
    Parse extends (expression: string, extensions: Extensions) => null | z.TypeOf<z.ZodObject<Schema>>,
    Extensions extends ExtensionsBase
  >(
    name: Name,
    params: {
      schema?: Schema
      parse?: Parse
      extensions?: Extensions
    }
  ): Builder<
    ADT,
    // @ts-expect-error ...
    [
      [
        Name,
        {
          schema: SchemaBase extends Schema
            ? { _tag: z.ZodLiteral<Name> }
            : Schema & { _tag: z.ZodLiteral<Name> }
          parse: Parse
          extensions: ExtensionsBase extends Extensions ? {} : Extensions
        }
      ],
      ...StoredVariants
    ]
  >
  /**
   * Sugar for quickly defining ADT members that only have a schema.
   */
  variant<Name extends string, Schema extends SchemaBase>(
    name: Name,
    schema?: Schema
  ): Builder<
    ADT,
    [
      [
        Name,
        {
          schema: SchemaBase extends Schema
            ? { _tag: z.ZodLiteral<Name> }
            : Schema & { _tag: z.ZodLiteral<Name> }
        }
      ],
      ...StoredVariants
    ]
  >
}

export type InitialBuilder<ADT, StoredVariants extends StoredVariantsBase> = VariantBuilder<
  ADT,
  StoredVariants
>

export interface Builder<ADT, StoredVariants extends StoredVariantsBase>
  extends VariantBuilder<ADT, StoredVariants> {
  done(): ADT & GetADTMethods<StoredVariants> & VariantsApi<TupleToObject<StoredVariants[number]>>
}

type GetADTMethods<Members extends StoredVariantsBase> = {
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

type VariantsApi<T extends Record<string, StoredMemberDef>> = {
  [Key in keyof T]: VariantApi<T[Key]>
}

// prettier-ignore
type VariantApi<Def extends StoredMemberDef> = {
  schema: z.ZodObject<Def[`schema`]>
  is(value: unknown): value is z.TypeOf<z.ZodObject<Def[`schema`]>>
}
& (Record<string,unknown> extends z.TypeOf<ZodOmit<z.ZodObject<Def[`schema`]>, { _tag: true }>> ? {
  create(): z.TypeOf<z.ZodObject<Def[`schema`]>>
} : {
  create(input: z.TypeOf<ZodOmit<z.ZodObject<Def[`schema`]>, { _tag: true }>>): z.TypeOf<z.ZodObject<Def[`schema`]>>
})
& (IsUnknown<Def[`parse`]> extends true ? {} : {
  parse: Def[`parse`]
  parseOrThrow: Parse2OrThrow<z.TypeOf<z.ZodObject<Def[`schema`]>>>
})
& Def[`extensions`]

type Parse2<T = unknown> = (string: string) => null | T
type Parse2OrThrow<T = unknown> = (string: string) => T
type StoredVariantsBase = [StoredVariantBase, ...StoredVariantBase[]]
type StoredVariantBase = [string, StoredMemberDef]
type StoredMemberDef = {
  schema: z.ZodRawShape
  parse?: Parse2
  extensions?: ExtensionsBase
}
