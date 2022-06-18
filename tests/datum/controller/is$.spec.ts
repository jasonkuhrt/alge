import { $A, A, m } from '../../__helpers__.js'
import { expectType } from 'tsd'

it(`.is$() is a type guard / predicate function accepting any value`, () => {
  const mMaybe = Math.random() > 0.5 ? m : false

  // Statically fine, any value may be checked here.
  A.is$(`whatever`)

  // @ts-expect-error The type has not being narrowed yet.
  expectType<typeof m>(mMaybe)

  if (A.is$(mMaybe)) expectType<typeof m>(mMaybe)
  if (!A.is$(mMaybe)) expectType<false>(mMaybe)

  expect(A.is$({})).toBe(false)
  expect(A.is$([])).toBe(false)
  expect(A.is$(null)).toBe(false)
  expect(A.is$(1)).toBe(false)
  expect(A.is$(m)).toBe(true)
  expect(A.is$({ _: null })).toBe(false)
  expect(A.is$({ _tag: $A, _: { symbol: A._.symbol }, a: `` })).toBe(true)
  expect(A.is$({ _: { symbol: A._.symbol } })).toBe(true)
})
