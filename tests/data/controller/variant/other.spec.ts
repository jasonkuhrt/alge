import { $M, $N, A } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`._.symbol contains the unique symbol for this variant`, () => {
  expectType<symbol>(A.M._.symbol)
  expect(typeof A.M._.symbol).toBe(`symbol`)
})

it(`.name contains the name of the variant`, () => {
  expectType<$M>(A.M.name)
  expect(A.M.name).toBe($M)
  expectType<$N>(A.N.name)
  expect(A.N.name).toBe($N)
})

it(`.schema contains the zod schema for the variant`, () => {
  expectType<z.ZodSchema>(A.M.schema)
  expect(A.M.schema).toBeDefined()
  expect(A.M.schema.safeParse(``).success).toBe(false)
  expectType<z.ZodSchema>(A.N.schema)
  expect(A.N.schema).toBeDefined()
  expect(A.N.schema.safeParse(``).success).toBe(false)
})
