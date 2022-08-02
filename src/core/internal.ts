import { z } from 'zod'

export type SomeSchema = z.SomeZodObject

export type SomeSchemaDef = Record<string, z.ZodType<unknown>>
