/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import { Controller, GetConstructorInput } from './Controller'
import { z } from './lib/z'

export type SchemaBase = Record<string, z.ZodType<unknown>>

export type ExtensionsBase = Record<string, unknown>

export type NameBase = string

/**
 * The initial API for building an ADT.
 */
export type Initial<ADT extends StoredADT, Vs extends StoredVariants> = VariantRequired<ADT, Vs>

/**
 * The builder API when it is in a state where a variant is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
export interface VariantRequired<ADT extends StoredADT, Vs extends StoredVariants> {
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
  ): PostVariantBuilder<ADT, CreateStoredVariant<Name, Schema, false, Parse, Extensions>, Vs>

  /**
   * Sugar for quickly defining ADT members that only have a schema.
   */
  variant<Name extends string, Schema extends SchemaBase>(
    name: Name,
    schema?: Schema
  ): PostVariantBuilder<ADT, CreateStoredVariant<Name, Schema, false, never, never>, Vs>
}

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
export interface PostVariantBuilder<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants>
  extends VariantRequired<ADT, [V, ...Vs]> {
  codec(params: CodecParams<V>): PostCodecBuilder<ADT, StoredVariant.EnableCodec<V>, Vs>
  done(): Controller<ADT, [V, ...Vs]>
}

export interface CodecParams<V extends StoredVariant = StoredVariant> {
  encode: Encoder<V>
  decode: Decoder<V>
}

export type Encoder<V extends StoredVariant> = (decodedData: StoredVariant.GetType<V>) => string

export type Decoder<V extends StoredVariant> = (encodedData: string) => null | GetConstructorInput<V>

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
export interface PostCodecBuilder<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants>
  extends VariantRequired<ADT, [V, ...Vs]> {
  done(): Controller<ADT, [V, ...Vs]>
}

// Helpers

type CreateStoredVariant<
  Name extends NameBase,
  Schema extends SchemaBase,
  Codec extends boolean,
  Parse extends (expression: string, extensions: Extensions) => null | z.TypeOf<z.ZodObject<Schema>>,
  Extensions extends ExtensionsBase
> = {
  name: Name
  schema: SchemaBase extends Schema ? { _tag: z.ZodLiteral<Name> } : Schema & { _tag: z.ZodLiteral<Name> }
  codec: Codec
  parse: Parse
  // TODO
  // eslint-disable-next-line
  extensions: ExtensionsBase extends Extensions ? {} : Extensions
}

export type StoredADT<Name extends string = string> = {
  name: Name
}

export type StoredVariant = {
  name: string
  schema: z.ZodRawShape
  codec: boolean
  parse?: Parse2
  extensions?: ExtensionsBase
}

// eslint-disable-next-line
export namespace StoredVariant {
  export type EnableCodec<V extends StoredVariant> = Omit<V, `codec`> & {
    codec: true
  }
  export type GetType<V extends StoredVariant> = z.TypeOf<z.ZodObject<V[`schema`]>>
  export type GetZodSchema<V extends StoredVariant> = z.ZodObject<V[`schema`]>
}

export type StoredVariants = [StoredVariant, ...StoredVariant[]]

// eslint-disable-next-line
export namespace StoredVariants {
  export type ZodUnion<Vs extends StoredVariants> = z.ZodUnion<ToZodObjects<Vs>>
  export type Union<Vs extends StoredVariants> = z.TypeOf<ZodUnion<Vs>>
  type ToZodObjects<Vs extends StoredVariants> = {
    // @ts-expect-error todo
    [Index in keyof Vs]: z.ZodObject<Vs[Index][`schema`]>
  }
}

export type Parse2<T = unknown> = (string: string) => null | T

export type Parse2OrThrow<T = unknown> = (string: string) => T
