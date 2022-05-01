import { StoredVariant } from './types'
import { z } from 'zod'

export type SomeVariant = {
  name: string
  schema: z.SomeZodObject
  encode: never | SomeEncoderDefinition
  decode: never | SomeDecoderDefinition
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

export type SomeVariantDefinition = Omit<StoredVariant, 'codec' | 'schema'> & {
  codec?: SomeCodecDefinition
  schema: z.SomeZodObject
}

export type SomeADT = {
  name: string
  schema: SomeZodADT
}

export type SomeZodADT = z.ZodUnion<[z.SomeZodObject, ...z.SomeZodObject[]]>

export type SomeSchema = Record<string, z.ZodType<unknown>>
