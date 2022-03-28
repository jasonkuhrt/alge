import { IsUnknown, TupleToObject } from './helpers'
import { ZodOmit } from './ZodPlus'
import { z } from 'zod'

export type SchemaBase = Record<string, z.ZodType<unknown>>

export type ExtensionsBase = Record<string, unknown>

export type Builder<ADT, Members extends StoredMembers> = {
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
      ...Members
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
      ...Members
    ]
  >
  done(): ADT & GetADTMethods<Members> & MembersApi<TupleToObject<Members[number]>>
}

type GetADTMethods<Members extends StoredMembers> = {
  schema: GetADTSchema<Members>
} & (IsAllMembersHaveParse<Members> extends true
  ? {
      parse: Parse2<z.TypeOf<GetADTSchema<Members>>>
      parseOrThrow: Parse2OrThrow<z.TypeOf<GetADTSchema<Members>>>
    }
  : {})

type IsAllMembersHaveParse<Members extends StoredMembers> = {
  // @ts-expect-error adf
  [K in keyof Members]: IsUnknown<Members[K][1][`parse`]> extends true ? `missing` : never
} extends [never, ...never[]]
  ? true
  : false

type GetADTSchema<Members extends StoredMembers> = z.ZodUnion<{
  // @ts-expect-error adf
  [K in keyof Members]: z.ZodObject<Members[K][1][`schema`]>
}>

type MembersApi<T extends Record<string, StoredMemberDef>> = {
  [Key in keyof T]: MemberApi<T[Key]>
}

// prettier-ignore
type MemberApi<Def extends StoredMemberDef> = {
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
type StoredMembers = [StoredMember, ...StoredMember[]]
type StoredMember = [string, StoredMemberDef]
type StoredMemberDef = {
  schema: z.ZodRawShape
  parse?: Parse2
  extensions?: ExtensionsBase
}
