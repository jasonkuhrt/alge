import { A, a } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'

it(`.is() is a type guard / predicate function accepting only records of the ADT`, () => {
  // @ts-expect-error: value is not an ADT record.
  A.is(`whatever`)
  if (A.is(a)) expectType<typeof a>(a)
  expect(A.is(a)).toBe(true)
})
