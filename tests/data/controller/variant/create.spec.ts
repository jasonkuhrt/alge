import { data } from '../../../../src/index_.js'
import { $A, $M, $N, A } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`If schema not given (aka. no properties), then constructor does not accept input`, () => {
  const A = data($A).variant($N).variant($M).done()
  // @ts-expect-error: empty object still not like empty variant
  A.N.create({})
  expect(A.N.create()).toEqual({ _tag: $N, _: { tag: $N, symbol: A.N._.symbol } })
  expect(A.M.create()).toEqual({ _tag: $M, _: { tag: $M, symbol: A.M._.symbol } })
  // eslint-disable-next-line
  expect((A.M as any).is({})).toEqual(false)
  expect(A.M.is$({})).toEqual(false)
})
it(`If schema only has optional properties then constructor input is optional`, () => {
  const A = data($A).variant($M).schema({ m: z.number().optional() }).done()
  A.M.create()
  A.M.create({})
  expect(A.M.create()).toEqual({ _tag: $M, _: { tag: $M, symbol: A.M._.symbol } })
  expect(A.M.create({})).toEqual({ _tag: $M, _: { tag: $M, symbol: A.M._.symbol } })
  expect(A.M.create({ m: 1 })).toEqual({ m: 1, _tag: $M, _: { tag: $M, symbol: A.M._.symbol } })
})
it(`creates the variant`, () => {
  // @ts-expect-error: Invalid input
  A.M.create({ x: 1 })

  // @ts-expect-error: Input required
  A.M.create()

  // @ts-expect-error: Excess invalid input
  A.M.create({ m: `m`, n: 2 })

  const m = A.M.create({ m: `m` })
  expectType<{ _tag: $M; m: string }>(m)
  expect(m).toEqual({ _tag: $M, _: { tag: $M, symbol: A.M._.symbol }, m: `m` })

  const n = A.N.create({ n: 1 })
  expectType<{ _tag: $N; n: number }>(n)
  expect(n).toEqual({ _tag: $N, _: { tag: $N, symbol: A.N._.symbol }, n: 1 })
})
