import { InitialBuilder } from './Builder'
import { Errors } from './Errors'
import { code, isEmpty } from './helpers'
import { OmitTag } from './Types'
import { ZodOmit } from './ZodPlus'
import endent from 'endent'
import { z } from 'zod'

/**
 * Base properties of a data type.
 */
export type VariantBase<Tag extends string = string> = {
  _tag: Tag
}

export type VariantNamespaceBase = {
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
export const createCreate = <ADTMember extends VariantBase>(
  memberTag: ADTMember[`_tag`],
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
export const createIs = <ADTMember extends VariantBase>(
  memberTag: ADTMember[`_tag`]
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
  return typeof x === `object` && x !== null && (x as any)._tag === memberTag
}

/**
 * Helper for implementing parseOrThrow.
 *
 * @param parser -  The parse function. This wraps it to automate an implementation of parseOrThrow.
 * @param  dataTypeMemberName - The name of the data type trying to be parsed. Used for nicer error messages.
 * @returns The data type.
 * @throws An error if parsing fails.
 */
export const createParseOrThrow = <ADTMember extends VariantBase>(
  parser: Parse<ADTMember>,
  dataTypeMemberName: ADTMember[`_tag`] | ADTMember[`_tag`][]
): ((x: string) => ADTMember) => {
  return (x) => {
    const result = parser(x)

    if (result === null) {
      // prettier-ignore
      const message =
        Array.isArray(dataTypeMemberName)
        ? endent`
            Could not parse the given string into any of the data types: ${dataTypeMemberName.map(_=>`"${_}"`).join(`, `)}.
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
): DeriveEnum<S[`_def`][`options`]> => {
  return schema._def.options.reduce((_enum, literal) => {
    return Object.assign(_enum, { [literal._def.value]: literal._def.value })
  }, {}) as any
}

type DeriveEnum<Literals extends [...z.ZodLiteral<string>[]]> = {
  [k in Literals[number] as k[`_def`][`value`]]: k[`_def`][`value`]
}

export const deriveCreate =
  <S extends z.ZodObject<{ _tag: z.ZodLiteral<string> }>>(schema: S) =>
  (input: z.TypeOf<ZodOmit<S, { _tag: true }>>): z.TypeOf<S> => {
    return {
      ...input,
      _tag: schema._def.shape()._tag._def.value,
    }
  }

export const deriveIs =
  <S extends ADTMember>(schema: S) =>
  (value: unknown): value is z.TypeOf<S> => {
    return (
      typeof value === `object` && value !== null && (value as any)._tag === schema._def.shape()._tag.value
    )
  }

type ADTMember = z.ZodObject<{
  _tag: z.ZodLiteral<string>
}>

/**
 * Define an algebraic data type. There must be at least two members. If all members have a parse function then an ADT level parse function will automatically be derived.
 */
// @ts-expect-error empty init tuple
export const create = <Name extends string>(name: Name): InitialBuilder<{ name: Name }, []> => {
  const variants: [string, z.SomeZodObject][] = []

  const api = {
    variant: (name: string, schema: Record<string, z.ZodType<unknown>>) => {
      variants.push([name, z.object(schema)])
      return api
    },
    done: () => {
      if (isEmpty(variants)) {
        throw Errors.UserMistake.create(
          `No variants defined for ADT ${code(name)} but ${code(
            `.done()`
          )} was called. You can only call ${code(
            `.done()`
          )} after your ADT has at least one variant defined (via ${code(`.variant()`)}).`
        )
      }
      return {
        name,
        schema: z.union([variants[0]![1]!, variants[1]![1]!, ...variants.slice(2).map((_) => _[1]!)]),
      }
    },
  }

  return api as any
}

// export type Infer<T extends { schema: z.ZodUnion<[z.SomeZodObject, ...z.SomeZodObject[]]> }> = {
//   `*`: z.infer<T[`schema`]>
//   // TODO members
// }
