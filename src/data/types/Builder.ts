/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import { SomeSchemaDef } from '../../core/internal.js'
import {
  CodecImplementation,
  CreateStoredRecord,
  CreateStoredRecordFromRecordController,
  ExtensionsBase,
  SomeName,
  StoredRecords,
} from '../../core/types.js'
import { SomeRecordController } from '../../record/types/controller.js'
import { StoredRecord } from '../../record/types/StoredRecord.js'
import { DataController } from './Controller.js'

/**
 * The initial API for building an ADT.
 */
export type Initial<ADT extends StoredADT, Rs extends StoredRecords> = RecordRequired<ADT, Rs>

/**
 * The builder API when it is in a state where a record is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
// prettier-ignore
export interface RecordRequired<ADT extends StoredADT, Rs extends StoredRecords> {
  record<Name extends string>(name: Name): PostRecord<ADT, CreateStoredRecord<Name>, Rs>
  record<DC extends SomeRecordController>(record: DC): PostRecord<ADT, CreateStoredRecordFromRecordController<DC>, Rs>
}

/**
 * The builder API when it is in a state where a record is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
// prettier-ignore
export interface PostRecord<ADT extends StoredADT, R extends StoredRecord, Vs extends StoredRecords>
       extends RecordRequired<ADT, [R, ...Vs]>,
               Done<ADT, R, Vs> {
  schema<Schema extends SomeSchemaDef>(schema: Schema): PostSchema<ADT, StoredRecord.AddSchemaDefinition<Schema, R>, Vs>
}

/**
 * The builder API when it is a state of having at least one record defined.
 * At this point the ADT can be marked as done.
 */
// prettier-ignore
export interface PostSchema<ADT extends StoredADT, R extends StoredRecord, Rs extends StoredRecords>
       extends RecordRequired<ADT, [R, ...Rs]>,
               Done<ADT, R, Rs> {
  codec<Name extends string>(name: Name, implementation: CodecImplementation<R>): PostSchema<ADT, StoredRecord.AddCodec<Name, R>, Rs>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostSchema<ADT, StoredRecord.AddExtensions<Extensions, R>, Rs>
}

export interface Done<ADT extends StoredADT, R extends StoredRecord, Rs extends StoredRecords> {
  done(): DataController<ADT, [R, ...Rs]>
}

// Helpers

export type StoredADT<Name extends SomeName = SomeName> = {
  name: Name
}

export namespace StoredADT {
  export type Create<Name extends SomeName = SomeName> = StoredADT<Name>
}
