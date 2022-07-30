/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import { CodecImplementation, ExtensionsBase, SchemaBase, StoredVariant } from '../../core/types.js'
import { Datum } from './controller.js'
import { SomeDefaultsProvider } from './internal.js'

export type DefaultsBase = object

/**
 * The initial API for building an ADT.
 */
export type Initial<Tag extends string> = PostTag<StoredVariant.Create<Tag>>

/**
 * The builder API when it is in a state where a variant is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
export interface PostTag<V extends StoredVariant> extends Done<V> {
  /**
   * TODO
   */
  // prettier-ignore
  schema<Schema extends SchemaBase>(schema: Schema): PostSchema<StoredVariant.AddSchema<Schema, V>>
  // prettier-ignore
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredVariant.AddExtensions<Extensions, V>>
  // prettier-ignore
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostCodec<StoredVariant.AddCodec<Name, V>>
}

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
export interface PostSchema<V extends StoredVariant> extends Done<V> {
  // prettier-ignore
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostCodec<StoredVariant.AddCodec<Name, V>>
  // prettier-ignore
  defaults<Defaults extends Partial<StoredVariant.GetType<V>>>(defaults: SomeDefaultsProvider<Partial<StoredVariant.GetType<V>>, Defaults>): PostDefaults<StoredVariant.AddDefaults<V, Defaults>>
  // prettier-ignore
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredVariant.AddExtensions<Extensions, V>>
}

export interface PostExtend<V extends StoredVariant> extends Done<V> {
  // prettier-ignore
  defaults<Defaults extends Partial<StoredVariant.GetType<V>>>(defaults: SomeDefaultsProvider<Partial<StoredVariant.GetType<V>>, Defaults>): PostDefaults<StoredVariant.AddDefaults<V, Defaults>>
  // prettier-ignore
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostCodec<StoredVariant.AddCodec<Name, V>>
}

export interface PostDefaults<V extends StoredVariant> extends Done<V> {
  // prettier-ignore
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostCodec<StoredVariant.AddCodec<Name, V>>
  // prettier-ignore
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredVariant.AddExtensions<Extensions, V>>
}

// TODO allow multiple codecs
export type PostCodec<V extends StoredVariant> = Done<V>

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
export interface Extend<V extends StoredVariant> {
  /**
   * Extend the ADT with new properties.
   * TODO
   */
  // prettier-ignore
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): Extend<StoredVariant.AddExtensions<Extensions, V>>
}

export interface Done<V extends StoredVariant> {
  done(): Datum<[V], V>
}

// Helpers

export type StoredDatum<Name extends string = string> = {
  name: Name
}
