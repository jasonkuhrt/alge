import { $A, A, m, n } from '../../__helpers__.js'
import { expectType } from 'tsd'

it(`.is() is a type guard / predicate function accepting only variants of the ADT`, () => {
  const mn = Math.random() > 0.5 ? m : n

  // @ts-expect-error: value is not an ADT variant.
  A.M.is(`whatever`)

  // @ts-expect-error The type has not been narrowed yet.
  expectType<typeof m>(mn)

  if (A.M.is(mn)) expectType<typeof m>(mn)
  if (!A.M.is(mn)) expectType<typeof n>(mn)

  expect(A.M.is(n)).toBe(false)
  expect(A.M.is(m)).toBe(true)
  expect(A.N.is(m)).toBe(false)
  expect(A.N.is(n)).toBe(true)
})

it(`.is$() is a type guard / predicate function accepting any value`, () => {
  const mMaybe = Math.random() > 0.5 ? m : false

  // Statically fine, any value may be checked here.
  A.M.is$(`whatever`)

  // @ts-expect-error The type has not being narrowed yet.
  expectType<typeof m>(mMaybe)

  if (A.M.is$(mMaybe)) expectType<typeof m>(mMaybe)
  if (!A.M.is$(mMaybe)) expectType<false>(mMaybe)

  expect(A.M.is$({})).toBe(false)
  expect(A.M.is$([])).toBe(false)
  expect(A.M.is$(null)).toBe(false)
  expect(A.M.is$(1)).toBe(false)
  expect(A.M.is$(m)).toBe(true)
  expect(A.M.is$({ _: null })).toBe(false)
  expect(A.M.is$({ _tag: $A, _: { symbol: A.M._.symbol }, a: `` })).toBe(true)
  expect(A.M.is$({ _: { symbol: A.M._.symbol } })).toBe(true)
})
