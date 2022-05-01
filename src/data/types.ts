/**
 * This module is concerned with the static types for the API of building up an ADT.
 */

import {
  CodecDefiniton,
  CreateStoredVariant,
  CreateStoredVariantFromDatum,
  ExtensionsBase,
  SchemaBase,
  StoredVariant,
  StoredVariants,
} from '../core/types'
import { Controller } from './Controller'
import { SomeDatum } from '~/datum/controller'

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
   * TODO
   */
  // prettier-ignore
  variant<Name extends string>(name: Name): PostVariant<ADT, CreateStoredVariant<Name>, Vs>
  /**
   * TODO
   */
  // prettier-ignore
  variant<TDatumn extends SomeDatum>(datum: TDatumn): PostVariant<ADT, CreateStoredVariantFromDatum<TDatumn>, Vs>
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
  schema<Schema extends SchemaBase>(schema: Schema): PostSchema<ADT, StoredVariant.AddSchema<Schema, V>, Vs>
}

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
export interface PostSchema<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants>
  extends VariantRequired<ADT, [V, ...Vs]>,
    Done<ADT, V, Vs> {
  codec(definition: CodecDefiniton<V>): PostCodecBuilder<ADT, StoredVariant.AddCodec<V>, Vs>
  /**
   * Extend the ADT with new properties.
   * TODO
   */
  //prettier-ignore
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostSchema<ADT, StoredVariant.AddExtensions<Extensions, V>, Vs>
}

/**
 * The builder API when it is a state of having at least one variant defined.
 * At this point the ADT can be marked as done.
 */
export interface PostCodecBuilder<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants>
  extends VariantRequired<ADT, [V, ...Vs]>,
    Done<ADT, V, Vs> {
  /**
   * Extend the ADT with new properties.
   * TODO
   */
  //prettier-ignore
  extend<Extensions extends ExtensionsBase>(extensions: Extensions): PostCodecBuilder<ADT, StoredVariant.AddExtensions<Extensions, V>, Vs>
}

export interface Done<ADT extends StoredADT, V extends StoredVariant, Vs extends StoredVariants> {
  done(): Controller<ADT, [V, ...Vs]>
}

// Helpers

export type StoredADT<Name extends string = string> = {
  name: Name
}
