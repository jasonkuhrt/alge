import { DefaultsBase, InputBase, StoredVariant } from './types'
import { z } from 'zod'

export type SomeVariant = {
  name: string
  schema: z.SomeZodObject
  encode: never | SomeEncoderDefinition
  decode: never | SomeDecoderDefinition
  _: {
    defaultsProvider: null | SomeDefaultsProvider
  }
}

export type SomeVariantConstructorInput = Record<string, unknown>

export type SomeCodecDefinition = {
  encode: SomeEncoderDefinition
  decode: SomeDecoderDefinition
}

export type SomeEncoderDefinition = (variant: SomeVariant) => string

export type SomeVariantSchema = z.SomeZodObject

export type SomeDecoderDefinition = (
  encodedData: string,
  extensions: { schema: SomeVariantSchema; name: string; [key: string]: unknown }
) => null | SomeVariantConstructorInput

export type SomeDefaultsProvider<
  PotentialInput extends InputBase = InputBase,
  Defaults extends DefaultsBase = DefaultsBase
> = (potentialInput: PotentialInput) => Defaults

export type SomeVariantDefinition = Omit<StoredVariant, 'codec' | 'schema' | 'defaults'> & {
  codec?: SomeCodecDefinition
  schema: z.SomeZodObject
  defaultsProvider: null | SomeDefaultsProvider
}

export type SomeADT = {
  name: string
  schema: SomeZodADT
}

export type SomeZodADT = z.ZodUnion<[z.SomeZodObject, ...z.SomeZodObject[]]>

export type SomeSchema = Record<string, z.ZodType<unknown>>
