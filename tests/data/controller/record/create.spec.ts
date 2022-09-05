import { data } from '../../../../src/index_.js'
import { $A, $AB, $B, AB } from '../../../__helpers__.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`If schema not given (aka. no properties), then constructor does not accept input`, () => {
  const AB = data($AB).record($A).record($B).done()
  // @ts-expect-error: empty object still not like empty record
  AB.B.create({})
  expect(AB.B.create()).toEqual({ _tag: $B, _: { tag: $B, symbol: AB.B._.symbol } })
  expect(AB.A.create()).toEqual({ _tag: $A, _: { tag: $A, symbol: AB.A._.symbol } })
  // eslint-disable-next-line
  expect((AB.A as any).is({})).toEqual(false)
  expect(AB.A.is$({})).toEqual(false)
})

it(`If schema only has optional properties then constructor input is optional`, () => {
  const AB = data($AB).record($A).schema({ m: z.number().optional() }).done()
  AB.A.create()
  AB.A.create({})
  expect(AB.A.create()).toEqual({ _tag: $A, _: { tag: $A, symbol: AB.A._.symbol } })
  expect(AB.A.create({})).toEqual({ _tag: $A, _: { tag: $A, symbol: AB.A._.symbol } })
  expect(AB.A.create({ m: 1 })).toEqual({ m: 1, _tag: $A, _: { tag: $A, symbol: AB.A._.symbol } })
})

it(`creates the record`, () => {
  // @ts-expect-error: Invalid input
  expect(() => AB.A.create({ x: 1 })).toThrowError()

  // @ts-expect-error: Input required
  expect(() => AB.A.create()).toThrowError()

  // @ts-expect-error: Excess invalid input
  AB.A.create({ m: `m`, n: 2 })

  const a = AB.A.create({ m: `m` })
  expectType<{ _tag: $A; m: string }>(a)
  expect(a).toEqual({ _tag: $A, _: { tag: $A, symbol: AB.A._.symbol }, m: `m` })

  const b = AB.B.create({ n: 1 })
  expectType<{ _tag: $B; n: number }>(b)
  expect(b).toEqual({ _tag: $B, _: { tag: $B, symbol: AB.B._.symbol }, n: 1 })
})
