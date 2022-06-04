import { Alge } from '~/'
import { expectType } from 'tsd'
import { z } from 'zod'

const datum = Alge.datum
const $A = `A`
type $A = typeof $A

it(`extends the datum with properties`, () => {
  const A = datum($A)
    .extend({ foo: 1 as const })
    .done()
  expectType<1>(A.foo)
  expect(A.foo).toBe(1)
})
// TODO make available to encoder as well.
it(`extensions are available to decoder`, () => {
  const A = datum($A)
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
  expectType<1>(A.foo)
  expect(A.foo).toBe(1)
})
