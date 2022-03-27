import endent from 'endent'
import { z } from 'zod'

/**
 * Get the data type without its tag property.
 */
export type OmitTag<T> = Omit<T, '_tag'>

/**
 * Base properties of a data type.
 */
export type ADTMemberBase<Tag extends string = string> = {
  _tag: Tag
}

export type ADTMemberNamespaceBase = {
  schema: z.Schema<unknown>
}

/**
 * Parse function that converts a string into a data type or `null` if some failure occurs.
 */
export type Parse<T> = (candidate: string) => null | T

/**
 * Check if two data type instances are equal.
 */
export type Equals<T> = (instance1: T, instance2: T) => boolean

/**
 * Stringify function that converts a data type into a string.
 */
export type Stringify<T> = (data: T) => string

/**
 * Helper for creating ADT `create` functions.
 */
export const createCreate = <ADTMember extends ADTMemberBase>(
  memberTag: ADTMember['_tag'],
  config: {
    create?: (params: OmitTag<ADTMember>) => OmitTag<ADTMember>
  } = {}
): ((params: OmitTag<ADTMember>) => ADTMember) => {
  return (params: OmitTag<ADTMember>): ADTMember => {
    const params_ = config.create ? config.create(params) : params
    return {
      _tag: memberTag,
      ...params_,
    } as ADTMember
  }
}

// export const createSchema = <
//   Member1 extends ADTMemberNamespaceBase,
//   Member2 extends ADTMemberNamespaceBase,
//   MembersRest extends ADTMemberNamespaceBase[],
// >(
//   member1: Member1,
//   member2: Member2,
//   ...members: [...MembersRest]
// ) => {
//   return z.union([member1.schema, member2.schema, ...members.map((_) => _.schema)])
// }

/**
 * Helper for creating ADT `is` functions.
 */
export const createIs = <ADTMember extends ADTMemberBase>(
  memberTag: ADTMember['_tag']
): ((x: unknown) => x is ADTMember) => {
  return (x: unknown): x is ADTMember => {
    return is(x, memberTag)
  }
}

/**
 * Helper for implementing ADT `is` functions.
 */
export const is = <TagName extends string>(x: unknown, memberTag: TagName): boolean => {
  // waiting for https://github.com/Microsoft/TypeScript/issues/21732
  return typeof x === 'object' && x !== null && (x as any)._tag === memberTag
}

/**
 * Helper for implementing parseOrThrow.
 *
 * @param parser The parse function. This wraps it to automate an implementation of parseOrThrow.
 * @param dataTypeMemberName The name of the data type trying to be parsed. Used for nicer error messages.
 * @returns The data type.
 * @throws An error if parsing fails.
 */
export const createParseOrThrow = <ADTMember extends ADTMemberBase>(
  parser: Parse<ADTMember>,
  dataTypeMemberName: ADTMember['_tag'] | ADTMember['_tag'][]
): ((x: string) => ADTMember) => {
  return (x) => {
    const result = parser(x)

    if (result === null) {
      // prettier-ignore
      const message =
        Array.isArray(dataTypeMemberName)
        ? endent`
            Could not parse the given string into any of the data types: ${dataTypeMemberName.map(_=>`"${_}"`).join(', ')}.
          `
        : endent`
            Could not parse the given string into the data type "${dataTypeMemberName}".
          `

      throw new Error(endent`
        ${message}

        The given string was:

        ${x}
      `)
    }

    return result
  }
}

export const deriveEnum = <S extends z.ZodUnion<[z.ZodLiteral<string>, ...z.ZodLiteral<string>[]]>>(
  schema: S
): DeriveEnum<S['_def']['options']> => {
  return schema._def.options.reduce((_enum, literal) => {
    return Object.assign(_enum, { [literal._def.value]: literal._def.value })
  }, {}) as any
}

type DeriveEnum<Literals extends [...z.ZodLiteral<string>[]]> = {
  [k in Literals[number] as k['_def']['value']]: k['_def']['value']
}

export const deriveCreate =
  <S extends z.ZodObject<{ _tag: z.ZodLiteral<string> }>>(schema: S) =>
  (input: z.TypeOf<ZodOmit<S, { _tag: true }>>): z.TypeOf<S> => {
    return {
      ...input,
      _tag: schema._def.shape()._tag._def.value,
    }
  }

type ZodOmit<
  T extends z.ZodObject<z.ZodRawShape>,
  Mask extends {
    [k in keyof T['shape']]?: true
  }
> = z.ZodObject<
  z.objectUtil.noNever<{
    [k in keyof T['shape']]: k extends keyof Mask ? never : T['shape'][k]
  }>
>

export const deriveIs =
  <S extends ADTMember>(schema: S) =>
  (value: unknown): value is z.TypeOf<S> => {
    return (
      typeof value === 'object' && value !== null && (value as any)._tag === schema._def.shape()._tag.value
    )
  }

type ADTMember = z.ZodObject<{
  _tag: z.ZodLiteral<string>
}>

type Parse2<T = unknown> = (string: string) => null | T
type Parse2OrThrow<T = unknown> = (string: string) => T
type StoredMembers = [StoredMember, ...StoredMember[]]
type StoredMember = [string, StoredMemberDef]
type StoredMemberDef = {
  schema: z.ZodRawShape
  parse?: Parse2
  extensions?: ExtensionsBase
}

type SchemaBase = Record<string, z.ZodType<unknown>>
type ExtensionsBase = Record<string, unknown>
type ADTBuilder<ADT, Members extends StoredMembers> = {
  member<
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
  ): ADTBuilder<
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
  member<Name extends string, Schema extends SchemaBase>(
    name: Name,
    schema?: Schema
  ): ADTBuilder<
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

type IsAllMembersHaveParse<Members extends StoredMembers> = {
  // @ts-expect-error adf
  [K in keyof Members]: IsUnknown<Members[K][1]['parse']> extends true ? 'missing' : never
} extends [never, ...never[]]
  ? true
  : false

type GetADTMethods<Members extends StoredMembers> = {
  schema: GetADTSchema<Members>
} & (IsAllMembersHaveParse<Members> extends true
  ? {
      parse: Parse2<z.TypeOf<GetADTSchema<Members>>>
      parseOrThrow: Parse2OrThrow<z.TypeOf<GetADTSchema<Members>>>
    }
  : {})

type GetADTSchema<Members extends StoredMembers> = z.ZodUnion<{
  // @ts-expect-error adf
  [K in keyof Members]: z.ZodObject<Members[K][1]['schema']>
}>

type MembersApi<T extends Record<string, StoredMemberDef>> = {
  [Key in keyof T]: MemberApi<T[Key]>
}

// prettier-ignore
type MemberApi<Def extends StoredMemberDef> = {
  schema: z.ZodObject<Def['schema']>
  is(value: unknown): value is z.TypeOf<z.ZodObject<Def['schema']>>
}
& (Record<string,unknown> extends z.TypeOf<ZodOmit<z.ZodObject<Def['schema']>, { _tag: true }>> ? {
  create(): z.TypeOf<z.ZodObject<Def['schema']>>
} : {
  create(input: z.TypeOf<ZodOmit<z.ZodObject<Def['schema']>, { _tag: true }>>): z.TypeOf<z.ZodObject<Def['schema']>>
})
& (IsUnknown<Def['parse']> extends true ? {} : {
  parse: Def['parse']
  parseOrThrow: Parse2OrThrow<z.TypeOf<z.ZodObject<Def['schema']>>>
})
& Def['extensions']

type IsUnknown<T> = IsEqual<T, unknown>

type IsEqual<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false

/**
 * Define an algebraic data type. There must be at least two members. If all members have a parse function then an ADT level parse function will automatically be derived.
 */
// @ts-expect-error empty init tuple
export const create = <Name extends string>(name: Name): ADTBuilder<{ name: Name }, []> => {
  const members: [string, z.SomeZodObject][] = []

  const api = {
    member: (name: string, schema: Record<string, z.ZodType<unknown>>) => {
      members.push([name, z.object(schema)])
      return api
    },
    done: () => {
      return {
        name,
        schema: z.union([members[0]![1]!, members[1]![1]!, ...members.slice(2).map((_) => _[1]!)]),
      }
    },
  }

  return api as any
}

export type Infer<T extends { schema: z.ZodUnion<[z.SomeZodObject, ...z.SomeZodObject[]]> }> = {
  '*': z.infer<T['schema']>
  // TODO members
}

type TupleToObject<T extends [string, any]> = { [key in T[0]]: Extract<T, [key, any]>[1] }
