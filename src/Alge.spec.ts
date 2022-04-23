import { Alge } from '.'
import { expectType } from 'tsd'
import { z } from 'zod'

const $A = `A`
const $N = `N`
const $M = `M`

type $A = typeof $A
type $N = typeof $N
type $M = typeof $M

const A = Alge.create($A).variant($M, { m: z.string() }).variant($N, { n: z.number() }).done()

const m = A.M.create({ m: `m` })
const n = A.N.create({ n: 1 })

describe(`builder`, () => {
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
  describe(`.extend()`, () => {
    it(`extends the ADT with properties`, () => {
      const A = Alge.create($A)
        .variant($M)
        .extend({ foo: 1 as const })
        .done()
      expectType<1>(A.M.foo)
      expect(A.M.foo).toBe(1)
    })
    // TODO make available to encoder as well.
    it(`extensions are available to decoder`, () => {
      const A = Alge.create($A)
        .variant($M, {
          m: z.string(),
        })
        .extend({ foo: 1 as const })
        .codec({
          encode: (data) => data.m,
          decode: (value, extensions) => {
            expectType<1>(extensions.foo)
            expect(extensions).toEqual({ foo: 1 })
            return { m: value }
          },
        })
        .done()
      expectType<1>(A.M.foo)
      expect(A.M.foo).toBe(1)
    })
  })
  describe(`.codec()`, () => {
    const B = Alge.create($A)
      .variant($M, { m: z.string() })
      .codec({
        encode: (data) => data.m,
        decode: (data) => (data === `m` ? { m: data } : null),
      })
      .done()
    it(`if not defined then variant API codec methods not available`, () => {
      expectType<never>(A.M.encode)
      expectType<never>(A.M.decode)
      //eslint-disable-next-line
      expect(() => (A.M as any).encode()).toThrowErrorMatchingInlineSnapshot(`"Codec not implemented."`)
      //eslint-disable-next-line
      expect(() => (A.M as any).decode()).toThrowErrorMatchingInlineSnapshot(`"Codec not implemented."`)
    })
    it(`defines an encode and decode method`, () => {
      const m = B.M.create({ m: `m` })
      expect(B.M.encode(m)).toEqual(`m`)

      const decodeResult = B.M.decode(`m`)
      expectType<null | z.infer<typeof A.M.schema>>(decodeResult)
      expect(B.M.decode(`m`)).toEqual(m)
      expect(B.M.decode(``)).toEqual(null)
    })
    it(`.decodeOrThrow throws if decoding fails`, () => {
      expect(() => B.M.decodeOrThrow(``)).toThrowErrorMatchingInlineSnapshot(
        `"Failed to decode value \`\` into a A."`
      )
    })
    it(`cannot define codec multiple times in the chain`, () => {
      // eslint-disable-next-line
      const _A = Alge.create($A)
        .variant($M, { m: z.string() })
        .codec({
          encode: (data) => data.m,
          decode: (data) => ({ m: data }),
        })
      // @ts-expect-error: second codec method not present.
      _A.codec
      expect(() =>
        //eslint-disable-next-line
        (_A as any).codec({
          //eslint-disable-next-line
          encode: (data: any) => data.m,
          //eslint-disable-next-line
          decode: (data: any) => ({ m: data }),
        })
      ).toThrowErrorMatchingInlineSnapshot(`"Codec already defined."`)
    })
    describe(`ADT API`, () => {
      it(`If defined for every variant then an aggregate codec is available on the ADT`, () => {
        const A = Alge.create($A)
          .variant($M, { m: z.string() })
          .codec({
            encode: (data) => data.m,
            decode: (data) => (data === `m` ? { m: data } : null),
          })
          .variant($N, { n: z.number() })
          .codec({
            encode: (data) => String(data.n),
            decode: (data) => (data.match(/\d/) !== null ? { n: Number(data) } : null),
          })
          .done()

        const m = A.M.create({ m: `m` })
        const n = A.N.create({ n: 1 })

        expectType<string>(A.encode(m))
        expectType<string>(A.encode(n))
        expect(A.encode).toBeDefined()
        expect(A.encode(m)).toEqual(`m`)
        expect(A.encode(n)).toEqual(`1`)

        expectType<null | typeof m | typeof n>(A.decode(`m`))
        expect(A.decode).toBeDefined()
        expect(A.decode(`m`)).toEqual(m)
        expect(A.decode(`1`)).toEqual(n)
      })
      it(`if not defined for every variant then the aggregate codec is not available with clear runtime and static time feedback about why.`, () => {
        expectType<never>(A.encode)
        // @ts-expect-error: codec not defined for every variant.
        // eslint-disable-next-line
        expect(() => A.encode(n)).toThrowErrorMatchingInlineSnapshot(
          `"ADT level codec not available because some variants did not define a codec: M, N"`
        )

        expectType<never>(A.decode)
        // @ts-expect-error: codec not defined for every variant.
        // eslint-disable-next-line
        expect(() => A.decode('m')).toThrowErrorMatchingInlineSnapshot(
          `"ADT level codec not available because some variants did not define a codec: M, N"`
        )
      })
    })
  })

  describe(`.variant()`, () => {
    it(`Can be given a name which becomes a static namespace on the ADT`, () => {
      expect(A.M).toBeDefined()
      expect(A.N).toBeDefined()
    })
  })
})

describe(`Controller`, () => {
  describe(`ADT API`, () => {
    it(`.schema points to a zod union schema combining all the defined variants`, () => {
      expect(A.schema.safeParse(``).success).toEqual(false)
      expectType<{ _tag: $M; m: string } | { _tag: $N; n: number }>(`` as unknown as z.infer<typeof A.schema>)
      expectType<z.infer<typeof A.M.schema> | z.infer<typeof A.N.schema>>(
        `` as unknown as z.infer<typeof A.schema>
      )
    })
    it(`.schema points to a zod object if only one variant is defined`, () => {
      const B = Alge.create(`B`).variant($M, { m: z.string() }).done()
      expect(B.schema.safeParse(``).success).toEqual(false)
      expectType<{ _tag: $M; m: string }>(`` as unknown as z.infer<typeof B.schema>)
      expectType<z.infer<typeof B.M.schema>>(`` as unknown as z.infer<typeof B.schema>)
    })
  })

  describe(`Variant API`, () => {
    it(`.symbol contains the unique symbol for this variant`, () => {
      expectType<symbol>(A.M.symbol)
      expect(typeof A.M.symbol).toBe(`symbol`)
    })

    it(`.name contains the name of the variant`, () => {
      expectType<$M>(A.M.name)
      expect(A.M.name).toBe($M)
      expectType<$N>(A.N.name)
      expect(A.N.name).toBe($N)
    })

    it(`.schema contains the zod schema for the variant`, () => {
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
        // @ts-expect-error: empty object still not like empty variant
        A.N.create({})
        expect(A.N.create()).toEqual({ _tag: $N, _: { symbol: A.N.symbol } })
        expect(A.M.create()).toEqual({ _tag: $M, _: { symbol: A.M.symbol } })
        // eslint-disable-next-line
        expect((A.M as any).is({})).toEqual(false)
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
      expect(A.M.is$({ _tag: $A, _: { symbol: A.M.symbol }, a: `` })).toBe(true)
      expect(A.M.is$({ _: { symbol: A.M.symbol } })).toBe(true)
    })
  })
})
