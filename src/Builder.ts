import { GetADTMethods, GetVariantsNamespacedMethods } from './Controller'
import { TupleToObject } from './lib/utils'
import { z } from './lib/z'

export type SchemaBase = Record<string, z.ZodType<unknown>>

export type ExtensionsBase = Record<string, unknown>

export type NameBase = string

export interface VariantBuilder<ADT, StoredVariants extends StoredVariantsBase> {
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

export type InitialBuilder<ADT, StoredVariants extends StoredVariantsBase> = VariantBuilder<
  ADT,
  StoredVariants
>

export interface PostVariantBuilder<ADT, StoredVariants extends StoredVariantsBase>
  extends VariantBuilder<ADT, StoredVariants> {
  // prettier-ignore
  done():
    ADT
    & GetADTMethods<StoredVariants>
    & GetVariantsNamespacedMethods<TupleToObject<StoredVariants[number]>>
}

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
