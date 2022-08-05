import { data, record } from '../../../src/index_.js'
import { $A, $AB, $B } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

describe(`.data(<record>)`, () => {
  //prettier-ignore
  const A = record($A).schema({ m: z.literal(`m`) }).done()
  //prettier-ignore
  const B = record($B)
    .schema({ n: z.literal(1) })
    .done()
  const AB = data($AB).record(A).record(B).done()
  AB.A._
  const m = AB.A.create({ m: `m` })
  const n = AB.B.create({ n: 1 })
  it(`The name is statically available.`, () => {
    expectType<typeof $AB>(AB.name)
    expect(AB.name).toBe($AB)
  })

  it(`can construct records`, () => {
    expectType<{ _tag: $A; m: `m` }>(m)
    expectType<{ _tag: $B; n: 1 }>(n)
    expect(m).toEqual({ _tag: $A, m: `m`, _: { tag: $A, symbol: AB.A._.symbol } })
    expect(n).toEqual({ _tag: $B, n: 1, _: { tag: $B, symbol: AB.B._.symbol } })
    // @ts-expect-error test
    // eslint-disable-next-line
    expect(() => AB.M.encode(m)).toThrowError()
    // @ts-expect-error test
    // eslint-disable-next-line
    expect(() => AB.M.decode(`m`)).toThrowError()
    // @ts-expect-error test
    // eslint-disable-next-line
    expect(() => AB.N.encode(n)).toThrowError()
    // @ts-expect-error test
    // eslint-disable-next-line
    expect(() => AB.N.decode(1)).toThrowError()
  })
})
