import { data, datum } from '../../../src/index_.js'
import { $A, $M, $N } from '../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

describe(`.data(<datumn>)`, () => {
  //prettier-ignore
  const M = datum($M).schema({ m: z.literal(`m`) }).done()
  //prettier-ignore
  const N = datum($N)
    .schema({ n: z.literal(1) })
    .done()
  const A = data($A).variant(M).variant(N).done()
  A.M._
  const m = A.M.create({ m: `m` })
  const n = A.N.create({ n: 1 })
  it(`The name is statically available.`, () => {
    expectType<typeof $A>(A.name)
    expect(A.name).toBe($A)
  })
  it(`can construct variants`, () => {
    expectType<{ _tag: $M; m: `m` }>(m)
    expectType<{ _tag: $N; n: 1 }>(n)
    expect(m).toEqual({ _tag: $M, m: `m`, _: { tag: $M, symbol: A.M._.symbol } })
    expect(n).toEqual({ _tag: $N, n: 1, _: { tag: $N, symbol: A.N._.symbol } })
    // @ts-expect-error test
    // eslint-disable-next-line
    expect(() => A.M.encode(m)).toThrowError()
    // @ts-expect-error test
    // eslint-disable-next-line
    expect(() => A.M.decode(`m`)).toThrowError()
    // @ts-expect-error test
    // eslint-disable-next-line
    expect(() => A.N.encode(n)).toThrowError()
    // @ts-expect-error test
    // eslint-disable-next-line
    expect(() => A.N.decode(1)).toThrowError()
  })
})
