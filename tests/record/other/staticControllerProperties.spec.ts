import { Alge } from '../../../src/index.js'
import { $A } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

const A = Alge.record($A).schema({ m: z.string() }).done()

it(`._.symbol contains the unique symbol for this record`, () => {
  expectType<symbol>(A._.symbol)
  expect(typeof A._.symbol).toBe(`symbol`)
})

it(`.name contains the name of the record`, () => {
  expectType<$A>(A.name)
  expect(A.name).toBe($A)
  expectType<$A>(A.name)
  expect(A.name).toBe($A)
})

it(`.schema contains the zod schema for the record`, () => {
  expectType<z.ZodSchema>(A.schema)
  expect(A.schema).toBeDefined()
  expect(A.schema.safeParse(``).success).toBe(false)
})

it(`.schema points to a zod object if only one record is defined`, () => {
  const B = Alge.record($A).schema({ m: z.string() }).done()
  expect(B.schema.safeParse(``).success).toEqual(false)
  expectType<{ _tag: $A; m: string }>(`` as unknown as z.infer<typeof B.schema>)
  expectType<z.infer<typeof B.schema>>(`` as unknown as z.infer<typeof B.schema>)
})
