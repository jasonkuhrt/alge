import { z } from 'zod'

export type SomeADT = {
  name: string
  schema: SomeZodADT
}

export type SomeZodADT = z.ZodUnion<[z.SomeZodObject, ...z.SomeZodObject[]]>
