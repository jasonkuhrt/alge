import { InputBase, StoredVariant } from '../../core/types.js'
import { DefaultsBase } from './builder.js'
import { SomeDatumController } from './controller.js'
import { z } from 'zod'

export type SomeDatumDefinition = Omit<StoredVariant, 'codec' | 'schema' | 'defaults'> & {
  codecs: [string, SomeCodecDefinition][]
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
  to: SomeEncoderDefinition
  from: SomeDecoderDefinition
}

export type SomeEncoderDefinition = (datum: SomeDatumController) => string

export type SomeDefaultsProvider<
  PotentialInput extends InputBase = InputBase,
  Defaults extends DefaultsBase = DefaultsBase
> = (potentialInput: PotentialInput) => Defaults

// any is needed to avoid screwing up inference
// eslint-disable-next-line
export type SomeEncoder = (value: any, context: { schema: z.ZodSchema }) => string

// any is needed to avoid screwing up inference
// eslint-disable-next-line
export type SomeEncoderJson = (value: any) => string

export type SomeDecoder = (encodedData: string) => null | object

export type SomeDecoderJson = (encodedData: string) => null | object

export type SomeDecodeOrThrower = (encodedData: string) => object

export type SomeDecodeOrThrowJson = (encodedData: string) => object

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
