/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import { CodecImplementation, ExtensionsBase, SchemaBase, StoredRecord } from '../../core/types.js'
import { RecordController } from './controller.js'
import { SomeDefaultsProvider } from './internal.js'

export type DefaultsBase = object

/**
 * The initial API for building an ADT.
 */
export type Initial<Tag extends string> = PostTag<StoredRecord.Create<Tag>>

/**
 * The builder API when it is in a state where a record is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
// prettier-ignore
export interface PostTag<V extends StoredRecord> extends Done<V> {
  schema<Schema extends SchemaBase>(schema: Schema): PostSchema<StoredRecord.AddSchema<Schema, V>>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredRecord.AddExtensions<Extensions, V>>
}

/**
 * The builder API when it is a state of having at least one record defined.
 * At this point the ADT can be marked as done.
 */
// prettier-ignore
export interface PostSchema<V extends StoredRecord> extends Done<V> {
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostSchema<StoredRecord.AddCodec<Name, V>>
  defaults<Defaults extends Partial<StoredRecord.GetType<V>>>(defaults: SomeDefaultsProvider<Partial<StoredRecord.GetType<V>>, Defaults>): PostDefaults<StoredRecord.AddDefaults<V, Defaults>>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredRecord.AddExtensions<Extensions, V>>
}

// prettier-ignore
export interface PostExtend<V extends StoredRecord> extends Done<V> {
  defaults<Defaults extends Partial<StoredRecord.GetType<V>>>(defaults: SomeDefaultsProvider<Partial<StoredRecord.GetType<V>>, Defaults>): PostDefaults<StoredRecord.AddDefaults<V, Defaults>>
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostExtend<StoredRecord.AddCodec<Name, V>>
}

// prettier-ignore
export interface PostDefaults<V extends StoredRecord> extends Done<V> {
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostDefaults<StoredRecord.AddCodec<Name, V>>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredRecord.AddExtensions<Extensions, V>>
}

/**
 * The builder API when it is a state of having at least one record defined.
 * At this point the ADT can be marked as done.
 */
// prettier-ignore
export interface Extend<V extends StoredRecord> {
  /**
   * Extend the ADT with new properties.
   * TODO
   */
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): Extend<StoredRecord.AddExtensions<Extensions, V>>
}

export interface Done<V extends StoredRecord> {
  done(): RecordController<[V], V>
}

// Helpers

export type ThisStoredRecord<Name extends string = string> = {
  name: Name
}
