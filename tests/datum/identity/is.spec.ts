import { A, a } from '../../__helpers__.js'
import { expectType } from 'tsd'

it(`.is() is a type guard / predicate function accepting only datums of the ADT`, () => {
  // @ts-expect-error: value is not an ADT datum.
  A.is(`whatever`)
  if (A.is(a)) expectType<typeof a>(a)
  expect(A.is(a)).toBe(true)
})
