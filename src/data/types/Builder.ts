/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import {
  CodecImplementation,
  CreateStoredDatum,
  CreateStoredDatumFromDatumController,
  ExtensionsBase,
  SchemaBase,
  StoredVariant,
  StoredVariants,
} from '../../core/types.js'
import { SomeDatumController } from '../../datum/types/controller.js'
import { DataController } from './Controller.js'

/**
 * The initial API for building an ADT.
 */
export type Initial<ADT extends StoredADT, Vs extends StoredVariants> = VariantRequired<ADT, Vs>

/**
 * The builder API when it is in a state where a variant is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
// prettier-ignore
export interface VariantRequired<ADT extends StoredADT, Vs extends StoredVariants> {
  variant<Name extends string>(name: Name): PostVariant<ADT, CreateStoredDatum<Name>, Vs>
  variant<DC extends SomeDatumController>(datum: DC): PostVariant<ADT, CreateStoredDatumFromDatumController<DC>, Vs>
}

/**
 * The builder API when it is in a state where a variant is required.
 *
 * @remarks This happens to be the initial state of the builder API.
 */
// prettier-ignore
export interface PostVariant<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants>
       extends VariantRequired<ADT, [V, ...Vs]>,
               Done<ADT, V, Vs> {
  schema<Schema extends SchemaBase>(schema: Schema): PostSchema<ADT, StoredVariant.AddSchema<Schema, V>, Vs>
}

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
// prettier-ignore
export interface PostSchema<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants>
       extends VariantRequired<ADT, [V, ...Vs]>,
               Done<ADT, V, Vs> {
  codec<Name extends string>(name: Name, implementation: CodecImplementation<V>): PostSchema<ADT, StoredVariant.AddCodec<Name, V>, Vs>
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostSchema<ADT, StoredVariant.AddExtensions<Extensions, V>, Vs>
}

export interface Done<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants> {
  done(): DataController<ADT, [V, ...Vs]>
}

// Helpers

export type StoredADT<Name extends string = string> = {
  name: Name
}
