/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import { CodecImplementation, ExtensionsBase, SchemaBase, StoredVariant } from '../../core/types.js'
import { DatumController } from './controller.js'
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
// prettier-ignore
export interface PostTag<V extends StoredVariant> extends Done<V> {
  schema<Schema extends SchemaBase>(schema: Schema): PostSchema<StoredVariant.AddSchema<Schema, V>>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredVariant.AddExtensions<Extensions, V>>
}

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
// prettier-ignore
export interface PostSchema<V extends StoredVariant> extends Done<V> {
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostSchema<StoredVariant.AddCodec<Name, V>>
  defaults<Defaults extends Partial<StoredVariant.GetType<V>>>(defaults: SomeDefaultsProvider<Partial<StoredVariant.GetType<V>>, Defaults>): PostDefaults<StoredVariant.AddDefaults<V, Defaults>>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredVariant.AddExtensions<Extensions, V>>
}

// prettier-ignore
export interface PostExtend<V extends StoredVariant> extends Done<V> {
  defaults<Defaults extends Partial<StoredVariant.GetType<V>>>(defaults: SomeDefaultsProvider<Partial<StoredVariant.GetType<V>>, Defaults>): PostDefaults<StoredVariant.AddDefaults<V, Defaults>>
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostExtend<StoredVariant.AddCodec<Name, V>>
}

// prettier-ignore
export interface PostDefaults<V extends StoredVariant> extends Done<V> {
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostDefaults<StoredVariant.AddCodec<Name, V>>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredVariant.AddExtensions<Extensions, V>>
}

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
// prettier-ignore
export interface Extend<V extends StoredVariant> {
  /**
   * Extend the ADT with new properties.
   * TODO
   */
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): Extend<StoredVariant.AddExtensions<Extensions, V>>
}

export interface Done<V extends StoredVariant> {
  done(): DatumController<[V], V>
}

// Helpers

export type StoredDatum<Name extends string = string> = {
  name: Name
}
