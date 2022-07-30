import { data } from '../../../src/index_.js'
import { $A, $M, $N } from '../__helpers__.js'
import { expectType } from 'tsd'

it(`The name is statically available.`, () => {
  const A = data($A).variant($N).variant($M).done()
  expectType<typeof $A>(A.name)
  expect(A.name).toBe($A)
})
