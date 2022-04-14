import { Alge } from '.'
import { expectType } from 'tsd'
import { z } from 'zod'

const $A = `A`
const $N = `N`
const $M = `M`

type $A = typeof $A
type $N = typeof $N
type $M = typeof $M

describe(`.create()`, () => {
  describe(`errors`, () => {
    it(`call .done() without any variants`, () => {
      const a = Alge.create($A)
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
    const A = Alge.create($A).variant($N).variant($M).done()
    expectType<typeof $A>(A.name)
    expect(A.name).toBe($A)
  })
})

describe(`.variant()`, () => {
  it(`Can be given a name which becomes a static namespace on the ADT`, () => {
    const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
    expect(A.M).toBeDefined()
    expect(A.N).toBeDefined()
  })
  describe(`namespace api`, () => {
    it(`The name of variant is statically known and available at runtime`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
      expectType<$M>(A.M.name)
      expect(A.M.name).toBe($M)
    })
    it(`The tag (symbol) of variant is statically known and available at runtime`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
      expectType<symbol>(A.M.symbol)
      expect(typeof A.M.symbol).toBe(`symbol`)
    })

    it(`.create()`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()

      const m = A.M.create({ a: `x` })
      expectType<{ _tag: `M`; a: string }>(m)
      expect(m).toEqual({ _tag: $M, _: { symbol: A.M.symbol }, a: `x` })

      const n = A.N.create({ a: `x` })
      expectType<{ _tag: `N`; a: string }>(n)
      expect(n).toEqual({ _tag: $N, _: { symbol: A.N.symbol }, a: `x` })
    })

    it(`.is() is a type guard / predicate function accepting only variants of the ADT`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { x: z.number().int() }).done()
      const m = A.M.create({ a: `x` })
      const n = A.N.create({ x: 1 })
      const mn = Math.random() > 0.5 ? m : n

      // @ts-expect-error: value is not an ADT variant.
      A.M.is(`whatever`)

      // @ts-expect-error The type has not been narrowed yet.
      expectType<typeof m>(mn)

      if (A.M.is(mn)) {
        expectType<typeof m>(mn)
      }

      expect(A.M.is(n)).toBe(false)
      expect(A.M.is(m)).toBe(true)
      expect(A.N.is(m)).toBe(false)
      expect(A.N.is(n)).toBe(true)
    })

    it(`.is$() is a type guard / predicate function accepting any value`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
      const m = A.M.create({ a: `x` })
      const mMaybe = Math.random() > 0.5 ? m : false

      // Statically fine, any value may be checked here.
      A.M.is$(`whatever`)

      // @ts-expect-error The type has not being narrowed yet.
      expectType<typeof m>(mMaybe)

      if (A.M.is$(mMaybe)) {
        expectType<typeof m>(mMaybe)
      }

      expect(A.M.is$({})).toBe(false)
      expect(A.M.is$([])).toBe(false)
      expect(A.M.is$(null)).toBe(false)
      expect(A.M.is$(1)).toBe(false)
      expect(A.M.is$(m)).toBe(true)
      expect(A.M.is$({ _: null })).toBe(false)
      expect(A.M.is$({ _tag: $A, _: { symbol: A.M.symbol }, a: `` })).toBe(true)
      expect(A.M.is$({ _: { symbol: A.M.symbol } })).toBe(true)
    })
  })
})
