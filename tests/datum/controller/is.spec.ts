import { A, m } from '../../__helpers__'
import { expectType } from 'tsd'

it(`.is() is a type guard / predicate function accepting only datums of the ADT`, () => {
  // @ts-expect-error: value is not an ADT datum.
  A.is(`whatever`)
  if (A.is(m)) expectType<typeof m>(m)
  expect(A.is(m)).toBe(true)
})
