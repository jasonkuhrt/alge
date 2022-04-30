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
   * Sugar for quickly defining ADT members that only have a schema.
   */
  variant<Name extends string>(
    name: Name
    //eslint-disable-next-line
  ): PostVariant<ADT, CreateStoredVariant<Name>, Vs>
}

/**
 * The builder API when it is in a state where a variant is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
export interface PostVariant<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants>
  extends PostSchema<ADT, V, Vs> {
  /**
   * TODO
   */
  schema<Schema extends SchemaBase>(
    schema: Schema
    //eslint-disable-next-line
  ): PostSchema<ADT, StoredVariant.AddSchema<Schema, V>, Vs>
}

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
export interface PostSchema<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants>
  extends VariantRequired<ADT, [V, ...Vs]> {
  codec(definition: CodecDefiniton<V>): PostCodecBuilder<ADT, StoredVariant.AddCodec<V>, Vs>
  /**
   * Extend the ADT with new properties.
   * TODO
   */
  extend<Extensions extends ExtensionsBase>(
    extensions: Extensions
  ): PostSchema<ADT, StoredVariant.AddExtensions<Extensions, V>, Vs>
  done(): Controller<ADT, [V, ...Vs]>
}

export interface CodecDefiniton<V extends StoredVariant = StoredVariant> {
  encode: EncoderDefinition<V>
  decode: DecoderDefinition<V>
}

export type EncoderDefinition<V extends StoredVariant> = (variant: StoredVariant.GetType<V>) => string

export type Encoder<V extends StoredVariant> = EncoderDefinition<V>

export type ADTEncoder<Vs extends StoredVariants> = (adt: StoredVariants.Union<Vs>) => string

export type DecoderDefinition<V extends StoredVariant> = (
  encodedData: string,
  extensions: V[`extensions`] & { schema: StoredVariant.GetZodSchema<V>; name: V[`name`] }
) => null | GetConstructorInput<V>

export type Decoder<V extends StoredVariant> = (value: string) => null | StoredVariant.GetType<V>

export type DecoderThatThrows<V extends StoredVariant> = (value: string) => StoredVariant.GetType<V>

export type ADTDecoder<Vs extends StoredVariants> = (value: string) => null | StoredVariants.Union<Vs>

export type ADTDecoderThatThrows<Vs extends StoredVariants> = (value: string) => StoredVariants.Union<Vs>

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
export interface PostCodecBuilder<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants>
  extends VariantRequired<ADT, [V, ...Vs]> {
  /**
   * Extend the ADT with new properties.
   * TODO
   */
  extend<Extensions extends ExtensionsBase>(
    extensions: Extensions
  ): PostCodecBuilder<ADT, StoredVariant.AddExtensions<Extensions, V>, Vs>
  done(): Controller<ADT, [V, ...Vs]>
}

// Helpers

export type CreateStoredVariant<Name extends NameBase> = {
  name: Name
  schema: { _tag: z.ZodLiteral<Name> }
  codec: false
  // TODO
  // eslint-disable-next-line
  extensions: {}
}

export type StoredADT<Name extends string = string> = {
  name: Name
}

export type StoredVariant = {
  name: string
  schema: z.ZodRawShape
  codec: boolean
  extensions: ExtensionsBase
}

// prettier-ignore
// eslint-disable-next-line
export namespace StoredVariant {
  export type AddSchema<Schema extends SchemaBase, V extends StoredVariant> =
    Omit<V, `schema`> & { schema: Schema & { _tag: z.ZodLiteral<V['name']> } }
    
  export type AddCodec<V extends StoredVariant> =
    Omit<V, `codec`> & { codec: true }

  export type AddExtensions<Extensions extends ExtensionsBase, V extends StoredVariant> =
    V & { extensions: Extensions }

  export type GetType<V extends StoredVariant> =
    z.TypeOf<z.ZodObject<V[`schema`]>>

  export type GetZodSchema<V extends StoredVariant> =
    z.ZodObject<V[`schema`]>
}

export type StoredVariants = [StoredVariant, ...StoredVariant[]]

// eslint-disable-next-line
export namespace StoredVariants {
  export type ZodUnion<Vs extends StoredVariants> = z.ZodUnion<ToZodObjects<Vs>>

  export type Union<Vs extends StoredVariants> = z.TypeOf<ZodUnion<Vs>>

  export type IsAllHaveCodec<Vs extends StoredVariants> = {
    // @ts-expect-error TODO
    [I in keyof Vs]: Vs[I][`codec`] extends true ? true : false
  } extends [true, ...true[]]
    ? true
    : false

  export type IsAllHaveParse<Vs extends StoredVariants> = {
    // @ts-expect-error adf
    [K in keyof Vs]: unknown extends Vs[K][1][`parse`] ? `missing` : never
  } extends [never, ...never[]]
    ? true
    : false

  type ToZodObjects<Vs extends StoredVariants> = {
    // @ts-expect-error todo
    [Index in keyof Vs]: z.ZodObject<Vs[Index][`schema`]>
  }
}
