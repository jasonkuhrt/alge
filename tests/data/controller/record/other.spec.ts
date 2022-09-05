import { $A, $B, AB } from '../../../__helpers__.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`._.symbol contains the unique symbol for this record`, () => {
  expectType<symbol>(AB.A._.symbol)
  expect(typeof AB.A._.symbol).toBe(`symbol`)
})

it(`.name contains the name of the record`, () => {
  expectType<$A>(AB.A.name)
  expect(AB.A.name).toBe($A)
  expectType<$B>(AB.B.name)
  expect(AB.B.name).toBe($B)
})

it(`.schema contains the zod schema for the record`, () => {
  expectType<z.ZodSchema>(AB.A.schema)
  expect(AB.A.schema).toBeDefined()
  expect(AB.A.schema.safeParse(``).success).toBe(false)
  expectType<z.ZodSchema>(AB.B.schema)
  expect(AB.B.schema).toBeDefined()
  expect(AB.B.schema.safeParse(``).success).toBe(false)
})
