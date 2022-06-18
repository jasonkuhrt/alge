import { data } from '../../../src/index_.js'
import { $A, $M } from '../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`extends the ADT with properties`, () => {
  const A = data($A)
    .variant($M)
    .extend({ foo: 1 as const })
    .done()
  expectType<1>(A.M.foo)
  expect(A.M.foo).toBe(1)
})
// TODO make available to encoder as well.
it(`extensions are available to decoder`, () => {
  const A = data($A)
    .variant($M)
    .schema({
      m: z.string(),
    })
    .extend({ foo: 1 as const })
    .codec({
      encode: (data) => data.m,
      decode: (value, extensions) => {
        expectType<1>(extensions.foo)
        expect(extensions).toEqual({ foo: 1 })
        return { m: value }
      },
    })
    .done()
  expectType<1>(A.M.foo)
  expect(A.M.foo).toBe(1)
})
