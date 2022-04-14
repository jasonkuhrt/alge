/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import { GetADTMethods, GetVariantsNamespacedMethods } from './Controller'
import { z } from './lib/z'

export type SchemaBase = Record<string, z.ZodType<unknown>>

export type ExtensionsBase = Record<string, unknown>

export type NameBase = string

/**
 * The initial API for building an ADT.
 */
export type Initial<ADT, StoredVariants extends StoredVariantsBase> = VariantRequired<ADT, StoredVariants>

/**
 * The builder API when it is in a state where a variant is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
export interface VariantRequired<ADT, StoredVariants extends StoredVariantsBase> {
  /**
   * Create a variant of this ADT.
   */
  variant<
    Name extends NameBase,
    Schema extends SchemaBase,
    Parse extends (expression: string, extensions: Extensions) => null | z.TypeOf<z.ZodObject<Schema>>,
    Extensions extends ExtensionsBase
  >(
    name: Name,
    params: { schema?: Schema; parse?: Parse; extensions?: Extensions }
    // @ts-expect-error ...
  ): PostVariantBuilder<ADT, [CreateStoredVariant<Name, Schema, Parse, Extensions>, ...StoredVariants]>

  /**
   * Sugar for quickly defining ADT members that only have a schema.
   */
  variant<Name extends string, Schema extends SchemaBase>(
    name: Name,
    schema?: Schema
  ): PostVariantBuilder<ADT, [CreateStoredVariant<Name, Schema, never, never>, ...StoredVariants]>
}

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
export interface PostVariantBuilder<ADT, Vs extends StoredVariantsBase> extends VariantRequired<ADT, Vs> {
  // prettier-ignore
  done():
    ADT
    & GetADTMethods<Vs>
    // & GetVariantsNamespacedMethods<TupleToObject<Vs[number]>>
    & GetVariantsNamespacedMethods<Vs>
}

// Helpers

type CreateStoredVariant<
  Name extends NameBase,
  Schema extends SchemaBase,
  Parse extends (expression: string, extensions: Extensions) => null | z.TypeOf<z.ZodObject<Schema>>,
  Extensions extends ExtensionsBase
> = [
  Name,
  {
    schema: SchemaBase extends Schema ? { _tag: z.ZodLiteral<Name> } : Schema & { _tag: z.ZodLiteral<Name> }
    parse: Parse
    // TODO
    // eslint-disable-next-line
    extensions: ExtensionsBase extends Extensions ? {} : Extensions
  }
]

export type GetName<V extends StoredVariantsBase> = V[0]

export type Parse2<T = unknown> = (string: string) => null | T

export type Parse2OrThrow<T = unknown> = (string: string) => T

export type StoredVariantsBase = [StoredVariantBase, ...StoredVariantBase[]]

type StoredVariantBase = [name: string, data: StoredVariantData]

export type StoredVariantRecordBase = Record<string, StoredVariantData>

export type StoredVariantData = {
  schema: z.ZodRawShape
  parse?: Parse2
  extensions?: ExtensionsBase
}
