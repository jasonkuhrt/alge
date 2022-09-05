import { Alge } from '../../../src/index.js'
import { $A, A } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`If schema not given (aka. no properties), then constructor does not accept input`, () => {
  const A = Alge.record($A).done()
  // @ts-expect-error: empty object still not like empty record
  A.create({})
  expect(A.create()).toEqual({ _tag: $A, _: { tag: $A, symbol: A._.symbol } })
  // eslint-disable-next-line
  expect((A as any).is({})).toEqual(false)
  expect(A.is$({})).toEqual(false)
})

it(`If schema only has optional properties then constructor input is optional`, () => {
  const A = Alge.record($A).schema({ m: z.number().optional() }).done()
  A.create()
  A.create({})
  expect(A.create()).toEqual({ _tag: $A, _: { tag: $A, symbol: A._.symbol } })
  expect(A.create({})).toEqual({ _tag: $A, _: { tag: $A, symbol: A._.symbol } })
  expect(A.create({ m: 1 })).toEqual({ m: 1, _tag: $A, _: { tag: $A, symbol: A._.symbol } })
})

it(`creates the record`, () => {
  // @ts-expect-error: Invalid input
  expect(() => A.create({ x: 1 })).toThrowError()

  // @ts-expect-error: Input required
  expect(() => A.create()).toThrowError()

  // @ts-expect-error: Excess invalid input
  A.create({ m: `m`, n: 2 })

  const m = A.create({ m: `m` })
  expectType<{ _tag: $A; m: string }>(m)
  expect(m).toEqual({ _tag: $A, _: { tag: $A, symbol: A._.symbol }, m: `m` })
})
