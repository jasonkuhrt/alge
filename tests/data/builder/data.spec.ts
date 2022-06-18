import { SomeDecoder, SomeEncoder } from '../../../src/datum/types/internal.js'
import { data, datum, Infer } from '../../../src/index_.js'
import { $A, $M, $N } from '../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

describe(`.data(<name>)`, () => {
  describe(`errors`, () => {
    it(`call .done() without any variants`, () => {
      const a = data($A)
      // @ts-expect-error .done is not statically available.
      // eslint-disable-next-line
      const done = a.done
      // eslint-disable-next-line
      expect(done).toThrowErrorMatchingInlineSnapshot(
        `"Alge User Mistake: No variants defined for ADT \`A\` but \`.done()\` was called. You can only call \`.done()\` after your ADT has at least one variant defined (via \`.variant()\`)."`
      )
    })
  })
  it(`The name is statically available.`, () => {
    const A = data($A).variant($N).variant($M).done()
    expectType<typeof $A>(A.name)
    expect(A.name).toBe($A)
  })
})

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
    expectType<typeof A.M.encode>(null as never)
    expectType<typeof A.N.encode>(null as never)
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
  it(`inherits codec`, () => {
    //prettier-ignore
    const M = datum($M).schema({ m: z.literal(`m`) }).codec({encode:(_)=>`m`,decode:(_)=>({m:`m`})}).done()
    //prettier-ignore
    const N = datum($N).schema({ n: z.literal(1) }).codec({encode:(_)=>`n`,decode:(_)=>({n:1})}).done()
    const A = data($A).variant(M).variant(N).done()
    const m = A.M.create({ m: `m` })
    const n = A.N.create({ n: 1 })
    expectType<SomeEncoder>(A.M.encode)
    expectType<SomeDecoder>(A.N.decode)
    expect(A.M.encode(m)).toEqual(`m`)
    expect(A.M.decode(`m`)).toEqual(m)
    expect(A.N.encode(n)).toEqual(`n`)
    expect(A.N.decode(`1`)).toEqual(n)
  })

  describe(`.Infer<>`, () => {
    it(`Can infer the ADT types from the runtime`, () => {
      expectType<Infer<typeof A>>({
        [`*`]: { _tag: $M, m: `m` },
        M: { _tag: $M, m: `m` },
        N: { _tag: $N, n: 1 },
      })
      expectType<Infer<typeof A>>({
        [`*`]: { _tag: $N, n: 1 },
        M: { _tag: $M, m: `m` },
        N: { _tag: $N, n: 1 },
      })
    })
  })
})
