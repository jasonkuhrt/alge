import { CodecParams, ExtensionsBase, Initial, StoredVariant } from './Builder'
import { Errors } from './Errors'
import { is } from './helpers'
import { r } from './lib/r'
import { code, isEmpty } from './lib/utils'
import { z } from './lib/z'
import { OmitTag } from './Types'

/**
 * Base properties of a data type.
 */
export type VariantBase<Tag extends symbol = symbol> = {
  _tag: Tag
  _: {
    symbol: symbol
  }
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
  tag: ADTMember[`_tag`],
  config: {
    create?: (params: OmitTag<ADTMember>) => OmitTag<ADTMember>
  } = {}
): ((params: OmitTag<ADTMember>) => ADTMember) => {
  return (params: OmitTag<ADTMember>): ADTMember => {
    const params_ = config.create ? config.create(params) : params
    return {
      _tag: tag,
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
// export const createIs = <ADTMember extends VariantBase>(
//   memberTag: ADTMember[`_tag`]
// ): ((x: unknown) => x is ADTMember) => {
//   return (x: unknown): x is ADTMember => {
//     return is$(x, memberTag)
//   }
// }

// /**
//  * Helper for implementing parseOrThrow.
//  *
//  * @param parser -  The parse function. This wraps it to automate an implementation of parseOrThrow.
//  * @param  dataTypeMemberName - The name of the data type trying to be parsed. Used for nicer error messages.
//  * @returns The data type.
//  * @throws An error if parsing fails.
//  */
// export const createParseOrThrow = <ADTMember extends VariantBase>(
//   parser: Parse<ADTMember>,
//   dataTypeMemberName: ADTMember[`_tag`] | ADTMember[`_tag`][]
// ): ((x: string) => ADTMember) => {
//   return (x) => {
//     const result = parser(x)

//     if (result === null) {
//       // prettier-ignore
//       const message =
//         Array.isArray(dataTypeMemberName)
//         ? endent`
//             Could not parse the given string into any of the data types: ${dataTypeMemberName.map(_=>`"${_}"`).join(`, `)}.
//           `
//         : endent`
//             Could not parse the given string into the data type "${dataTypeMemberName}".
//           `

//       throw new Error(endent`
//         ${message}

//         The given string was:

//         ${x}
//       `)
//     }

//     return result
//   }
// }

// export const deriveEnum = <S extends z.ZodUnion<[z.ZodLiteral<string>, ...z.ZodLiteral<string>[]]>>(
//   schema: S
// ): DeriveEnum<S[`_def`][`options`]> =>
//   // eslint-disable-next-line
//   schema._def.options.reduce((_enum, literal) => {
//     return Object.assign(_enum, { [literal._def.value]: literal._def.value })
//     // eslint-disable-next-line
//   }, {}) as any

// type DeriveEnum<Literals extends [...z.ZodLiteral<string>[]]> = {
//   [k in Literals[number] as k[`_def`][`value`]]: k[`_def`][`value`]
// }

// export const deriveCreate =
//   <S extends z.ZodObject<{ _tag: z.ZodLiteral<string> }>>(schema: S) =>
//   (input: z.TypeOf<z.Omit<S, { _tag: true }>>): z.TypeOf<S> => {
//     return {
//       ...input,
//       _tag: schema._def.shape()._tag._def.value,
//     }
//   }

// export const deriveIs =
//   <S extends ADTMember>(schema: S) =>
//   (value: unknown): value is z.TypeOf<S> => {
//     return (
//       // TODO
//       // eslint-disable-next-line
//       typeof value === `object` && value !== null && (value as any)._tag === schema._def.shape()._tag.value
//     )
//   }

// type ADTMember = z.ZodObject<{
//   _tag: z.ZodLiteral<string>
// }>

type SomeVariantDef = Omit<StoredVariant, `codec` | `schema`> & {
  codec?: CodecParams
  schema: z.SomeZodObject
}

/**
 * Define an algebraic data type. There must be at least two members. If all members have a parse function then an ADT level parse function will automatically be derived.
 */
// @ts-expect-error empty init tuple
export const create = <Name extends string>(name: Name): Initial<{ name: Name }, []> => {
  let currentVariant: null | SomeVariantDef = null
  const variants: SomeVariantDef[] = []

  const api = {
    variant: (name: string, schema: Record<string, z.ZodType<unknown>>) => {
      currentVariant = {
        name,
        schema: z.object(schema),
        extensions: {},
      }
      variants.push(currentVariant)
      return api
    },
    extend: (extensions: ExtensionsBase) => {
      if (!currentVariant) throw new Error(`Define variant first.`)
      currentVariant.extensions = {
        ...currentVariant.extensions,
        ...extensions,
      }
      return api
    },
    codec: (codecDef: CodecParams) => {
      if (!currentVariant) throw new Error(`Define variant first.`)
      if (currentVariant.codec) throw new Error(`Codec already defined.`)
      currentVariant.codec = codecDef
      return api
    },
    done: () => {
      if (isEmpty(variants)) throw createEmptyVariantsError({ name })

      const variantApis = r.pipe(
        variants,
        r.map((v) => {
          const symbol = Symbol(v.name)
          const api = {
            ...v,
            create: (input?: object) => ({
              _tag: v.name,
              _: {
                symbol,
              },
              ...input,
            }),
            symbol,
            //eslint-disable-next-line
            is$: (value: unknown) => is(value, symbol),
            is: (value: unknown) => is(value, symbol),
            decode: (value: string) => {
              if (!v.codec) throw new Error(`Codec not implemented.`)
              const data = v.codec.decode(value, v.extensions)
              if (data === null) return null
              return api.create(data)
            },
            decodeOrThrow: (value: string) => {
              const data = api.decode(value)
              if (data === null) throw new Error(`Failed to decode value \`${value}\` into a ${name}.`)
              return data
            },
            encode: (variant: object) => {
              if (!v.codec) throw new Error(`Codec not implemented.`)
              return v.codec.encode(variant)
            },
            ...v.extensions,
          }
          return api
        }),
        r.indexBy(r.prop(`name`))
      )

      const api = {
        name,
        schema:
          variants.length >= 2
            ? z.union([
                // eslint-disable-next-line
                variants[0]!.schema,
                // eslint-disable-next-line
                variants[1]!.schema,
                ...variants.slice(2).map((_) => _.schema),
              ])
            : variants.length === 1
            ? // eslint-disable-next-line
              variants[0]!.schema
            : null,
        encode: (variant: object) => {
          const variantsMissingCodecDef = variants.filter((v) => v.codec === undefined)
          if (variantsMissingCodecDef.length)
            throw new Error(
              `ADT level codec not available because some variants did not define a codec: ${variantsMissingCodecDef
                .map(r.prop(`name`))
                .join(`, `)}`
            )
          // TODO
          // eslint-disable-next-line
          const variantApi = variantApis[(variant as any)._tag]
          // TODO
          // eslint-disable-next-line
          if (!variantApi) throw new Error(`Failed to find Variant tagged ${(variant as any)._tag}`)
          return variantApi.encode(variant)
        },
        decode: (value: string) => {
          const variantsMissingCodecDef = variants.filter((v) => v.codec === undefined)
          if (variantsMissingCodecDef.length)
            throw new Error(
              `ADT level codec not available because some variants did not define a codec: ${variantsMissingCodecDef
                .map(r.prop(`name`))
                .join(`, `)}`
            )
          for (const variantApi of Object.values(variantApis)) {
            const result = variantApi.decode(value)
            if (result) return result
          }
          return null
        },
        decodeOrThrow: (value: string) => {
          const data = api.decode(value)
          if (data === null)
            throw new Error(`Failed to decode value \`${value}\` into any of the variants for this ADT.`)
          return data
        },
        ...variantApis,
      }

      return api
    },
  }

  // TODO
  // eslint-disable-next-line
  return api as any
}

// export type Infer<T extends { schema: z.ZodUnion<[z.SomeZodObject, ...z.SomeZodObject[]]> }> = {
//   `*`: z.infer<T[`schema`]>
//   // TODO members
// }

const createEmptyVariantsError = (params: { name: string }) =>
  Errors.UserMistake.create(
    `No variants defined for ADT ${code(params.name)} but ${code(
      `.done()`
    )} was called. You can only call ${code(
      `.done()`
    )} after your ADT has at least one variant defined (via ${code(`.variant()`)}).`
  )
