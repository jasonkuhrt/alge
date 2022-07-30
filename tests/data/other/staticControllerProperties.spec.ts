import { data } from '../../../src/index_.js'
import { $A, $AB, $B } from '../../__helpers__.js'
import { expectType } from 'tsd'

it(`The name is statically available.`, () => {
  const A = data($AB).variant($A).variant($B).done()
  expectType<typeof $AB>(A.name)
  expect(A.name).toBe($AB)
})
