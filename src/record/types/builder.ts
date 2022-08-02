/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import { SomeSchemaDef } from '../../core/internal.js'
import { CodecImplementation, ExtensionsBase } from '../../core/types.js'
import { RecordController } from './controller.js'
import { SomeDefaultsProvider } from './internal.js'
import { StoredRecord } from './StoredRecord.js'

export type SomeDefaults = object

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
export interface PostTag<R extends StoredRecord> extends Done<R> {
  schema<Schema extends SomeSchemaDef>(schema: Schema): PostSchema<StoredRecord.AddSchemaDefinition<Schema, R>>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredRecord.AddExtensions<Extensions, R>>
}

/**
 * The builder API when it is a state of having at least one record defined.
 * At this point the ADT can be marked as done.
 */
// prettier-ignore
export interface PostSchema<R extends StoredRecord> extends Done<R> {
  codec<Name extends string>(name: Name, implementation: CodecImplementation<R>): PostSchema<StoredRecord.AddCodec<Name, R>>
  defaults<Defaults extends Partial<StoredRecord.GetType<R>>>(defaults: SomeDefaultsProvider<Partial<StoredRecord.GetType<R>>, Defaults>): PostDefaults<StoredRecord.AddDefaults<R, Defaults>>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredRecord.AddExtensions<Extensions, R>>
}

// prettier-ignore
export interface PostExtend<R extends StoredRecord> extends Done<R> {
  defaults<Defaults extends Partial<StoredRecord.GetType<R>>>(defaults: SomeDefaultsProvider<Partial<StoredRecord.GetType<R>>, Defaults>): PostDefaults<StoredRecord.AddDefaults<R, Defaults>>
  codec<Name extends string>(name: Name, implementation: CodecImplementation<R>): PostExtend<StoredRecord.AddCodec<Name, R>>
}

// prettier-ignore
export interface PostDefaults<R extends StoredRecord> extends Done<R> {
  codec<Name extends string>(name: Name, implementation: CodecImplementation<R>): PostDefaults<StoredRecord.AddCodec<Name, R>>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostExtend<StoredRecord.AddExtensions<Extensions, R>>
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
