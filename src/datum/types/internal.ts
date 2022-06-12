import { DefaultsBase } from './builder'
import { SomeDatumController } from './controller'
import { InputBase, StoredVariant } from '~/core/types'
import { z } from 'zod'

export type SomeDatumDefinition = Omit<StoredVariant, 'codec' | 'schema' | 'defaults'> & {
  codec?: SomeCodecDefinition
  schema: z.SomeZodObject
  defaultsProvider: null | SomeDefaultsProvider
}

export type SomeDatumConstructorInput = Record<string, unknown>

export type SomeDatumSchema = z.SomeZodObject

export type SomeDecoderDefinition = (
  encodedData: string,
  extensions: { schema: SomeDatumSchema; name: string; [key: string]: unknown }
) => null | SomeDatumConstructorInput

export type SomeSchema = Record<string, z.ZodType<unknown>>

export type SomeCodecDefinition = {
  encode: SomeEncoderDefinition
  decode: SomeDecoderDefinition
}

export type SomeEncoderDefinition = (datum: SomeDatumController) => string

export type SomeDefaultsProvider<
  PotentialInput extends InputBase = InputBase,
  Defaults extends DefaultsBase = DefaultsBase
> = (potentialInput: PotentialInput) => Defaults

// eslint-disable-next-line
export type SomeEncoder = (value: any, context: { schema: z.ZodSchema }) => string

export type SomeDecoder = (encodedData: string) => null | object

export type SomeDecodeOrThrower = (encodedData: string) => object

export interface SomeDatumBuilder {
  schema: object
  extend: object
  codec: object
  defaults: (defaults: SomeDefaultsProvider) => object
  done: () => object
  _?: {
    innerChain: SomeDatumBuilder
  }
}
