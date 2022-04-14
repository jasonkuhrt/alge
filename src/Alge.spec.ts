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

  describe(`api`, () => {
    it(`.symbol contains the unique symbol for this variant`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
      expectType<symbol>(A.M.symbol)
      expect(typeof A.M.symbol).toBe(`symbol`)
    })

    it(`.name contains the name of the variant`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
      expectType<$M>(A.M.name)
      expect(A.M.name).toBe($M)
      expectType<$N>(A.N.name)
      expect(A.N.name).toBe($N)
    })

    it(`.schema contains the zod schema for the variant`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
      expectType<z.ZodSchema>(A.M.schema)
      expect(A.M.schema).toBeDefined()
      expect(A.M.schema.safeParse(``).success).toBe(false)
      expectType<z.ZodSchema>(A.N.schema)
      expect(A.N.schema).toBeDefined()
      expect(A.N.schema.safeParse(``).success).toBe(false)
    })

    describe(`.create()`, () => {
      it(`If schema not given (aka. no properties), then constructor does not accept input`, () => {
        const A = Alge.create($A).variant($N).variant($M).done()
        // @ts-expect-error: input not accepted
        A.N.create({})
        expect(A.N.create()).toEqual({ _tag: $N, _: { symbol: A.N.symbol } })
        expect(A.M.create()).toEqual({ _tag: $M, _: { symbol: A.M.symbol } })
        // @ts-expect-error: empty object still not like empty variant
        expect(A.M.is({})).toEqual(false)
        expect(A.M.is$({})).toEqual(false)
      })
      it(`If schema only has optional properties then constructor input is optional`, () => {
        const A = Alge.create($A).variant($M, { m: z.number().optional() }).done()
        A.M.create()
        A.M.create({})
        expect(A.M.create()).toEqual({ _tag: $M, _: { symbol: A.M.symbol } })
        expect(A.M.create({})).toEqual({ _tag: $M, _: { symbol: A.M.symbol } })
        expect(A.M.create({ m: 1 })).toEqual({ m: 1, _tag: $M, _: { symbol: A.M.symbol } })
      })
      it(`creates the variant`, () => {
        const A = Alge.create($A).variant($M, { m: z.string() }).variant($N, { n: z.number() }).done()

        // @ts-expect-error: Invalid input
        A.M.create({ x: 1 })

        // @ts-expect-error: Input required
        A.M.create()

        // @ts-expect-error: Excess invalid input
        A.M.create({ m: `m`, n: 2 })

        const m = A.M.create({ m: `m` })
        expectType<{ _tag: $M; m: string }>(m)
        expect(m).toEqual({ _tag: $M, _: { symbol: A.M.symbol }, m: `m` })

        const n = A.N.create({ n: 1 })
        expectType<{ _tag: $N; n: number }>(n)
        expect(n).toEqual({ _tag: $N, _: { symbol: A.N.symbol }, n: 1 })
      })
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
