/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import {
  CodecImplementation,
  CreateStoredRecord,
  CreateStoredRecordFromRecordController,
  ExtensionsBase,
  SchemaBase,
  StoredRecord,
  StoredRecords,
} from '../../core/types.js'
import { SomeRecordController } from '../../record/types/controller.js'
import { DataController } from './Controller.js'

/**
 * The initial API for building an ADT.
 */
export type Initial<ADT extends StoredADT, Vs extends StoredRecords> = RecordRequired<ADT, Vs>

/**
 * The builder API when it is in a state where a record is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
// prettier-ignore
export interface RecordRequired<ADT extends StoredADT, Vs extends StoredRecords> {
  record<Name extends string>(name: Name): PostRecord<ADT, CreateStoredRecord<Name>, Vs>
  record<DC extends SomeRecordController>(record: DC): PostRecord<ADT, CreateStoredRecordFromRecordController<DC>, Vs>
}

/**
 * The builder API when it is in a state where a record is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
// prettier-ignore
export interface PostRecord<ADT extends StoredADT, V extends StoredRecord, Vs extends StoredRecords>
       extends RecordRequired<ADT, [V, ...Vs]>,
               Done<ADT, V, Vs> {
  schema<Schema extends SchemaBase>(schema: Schema): PostSchema<ADT, StoredRecord.AddSchema<Schema, V>, Vs>
}

/**
 * The builder API when it is a state of having at least one record defined.
 * At this point the ADT can be marked as done.
 */
// prettier-ignore
export interface PostSchema<ADT extends StoredADT, V extends StoredRecord, Vs extends StoredRecords>
       extends RecordRequired<ADT, [V, ...Vs]>,
               Done<ADT, V, Vs> {
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostSchema<ADT, StoredRecord.AddCodec<Name, V>, Vs>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostSchema<ADT, StoredRecord.AddExtensions<Extensions, V>, Vs>
}

export interface Done<ADT extends StoredADT, V extends StoredRecord, Vs extends StoredRecords> {
  done(): DataController<ADT, [V, ...Vs]>
}

// Helpers

export type StoredADT<Name extends string = string> = {
  name: Name
}
