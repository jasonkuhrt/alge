import { $A, a, AB, b } from '../../../__helpers__.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'

it(`.is() is a type guard / predicate function accepting only records of the ADT`, () => {
  const aOrB = Math.random() > 0.5 ? a : b

  // @ts-expect-error: value is not an ADT record.
  AB.A.is(`whatever`)

  // @ts-expect-error The type has not been narrowed yet.
  expectType<typeof a>(aOrB)

  if (AB.A.is(aOrB)) expectType<typeof a>(aOrB)
  if (!AB.A.is(aOrB)) expectType<typeof b>(aOrB)

  expect(AB.A.is(b)).toBe(false)
  expect(AB.A.is(a)).toBe(true)
  expect(AB.B.is(a)).toBe(false)
  expect(AB.B.is(b)).toBe(true)
})

it(`.is$() is a type guard / predicate function accepting any value`, () => {
  const mMaybe = Math.random() > 0.5 ? a : false

  // Statically fine, any value may be checked here.
  AB.A.is$(`whatever`)

  // @ts-expect-error The type has not being narrowed yet.
  expectType<typeof a>(mMaybe)

  if (AB.A.is$(mMaybe)) expectType<typeof a>(mMaybe)
  if (!AB.A.is$(mMaybe)) expectType<false>(mMaybe)

  expect(AB.A.is$({})).toBe(false)
  expect(AB.A.is$([])).toBe(false)
  expect(AB.A.is$(null)).toBe(false)
  expect(AB.A.is$(1)).toBe(false)
  expect(AB.A.is$(a)).toBe(true)
  expect(AB.A.is$({ _: null })).toBe(false)
  expect(AB.A.is$({ _tag: $A, _: { symbol: AB.A._.symbol }, a: `` })).toBe(true)
  expect(AB.A.is$({ _: { symbol: AB.A._.symbol } })).toBe(true)
})
