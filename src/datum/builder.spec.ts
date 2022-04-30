import { datum } from './builder'
import { expectType } from 'tsd'
import { z } from 'zod'

const $A = `A`
const $N = `N`
const $M = `M`

type $A = typeof $A
type $N = typeof $N
type $M = typeof $M

const A = datum($A).schema({ m: z.string() }).done()

const m = A.create({ m: `m` })

describe(`Builder`, () => {
  describe(`.create()`, () => {
    it(`The name is statically available.`, () => {
      const A = datum($A).done()
      expectType<typeof $A>(A.name)
      expect(A.name).toBe($A)
    })
  })
  describe(`.extend()`, () => {
    it(`extends the datum with properties`, () => {
      const A = datum($A)
        .extend({ foo: 1 as const })
        .done()
      expectType<1>(A.foo)
      expect(A.foo).toBe(1)
    })
    // TODO make available to encoder as well.
    it(`extensions are available to decoder`, () => {
      const A = datum($A)
        .schema({
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
      expectType<1>(A.foo)
      expect(A.foo).toBe(1)
    })
  })
  describe(`.codec()`, () => {
    const B = datum($A)
      .schema({ m: z.string() })
      .codec({
        encode: (data) => data.m,
        decode: (data) => (data === `m` ? { m: data } : null),
      })
      .done()
    const m = B.create({ m: `m` })
    it(`cannot define codec multiple times in the chain`, () => {
      // eslint-disable-next-line
      const _A = datum($A)
        .schema({ m: z.string() })
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
    describe(`datum API`, () => {
      it(`if not defined then datum API codec methods not available`, () => {
        expectType<never>(A.encode)
        //eslint-disable-next-line
        expect(() => (A as any).encode()).toThrowErrorMatchingInlineSnapshot(`"Codec not implemented."`)
        expectType<never>(A.decode)
        //eslint-disable-next-line
        expect(() => (A as any).decode()).toThrowErrorMatchingInlineSnapshot(`"Codec not implemented."`)
        expectType<never>(A.decodeOrThrow)
        //prettier-ignore
        //eslint-disable-next-line
        expect(() => (A as any).decodeOrThrow()).toThrowErrorMatchingInlineSnapshot(`"Codec not implemented."`)
      })
      describe(`.decode()`, () => {
        it(`converts string into data or null on failure`, () => {
          const decodeResult = B.decode(`m`)
          expectType<null | z.infer<typeof A.schema>>(decodeResult)
          expect(B.decode(`m`)).toEqual(m)
          expect(B.decode(``)).toEqual(null)
        })
        it(`definition has access to the ADT schema`, () => {
          const A = datum(`A`)
            .schema({ m: z.string() })
            .codec({
              encode: (data) => data.m,
              decode: (value, { schema }) => {
                expectType<typeof A.schema>(schema)
                return schema.parse({ m: value, _tag: $A })
              },
            })
            .done()
          expect(A.decode(`m`)).toEqual(A.create({ m: `m` }))
        })
        it(`definition has access to the ADT schema even if no schema defined`, () => {
          const A = datum($A)
            .codec({
              encode: (data) => data._tag,
              decode: (value, { schema }) => {
                expectType<typeof A.schema>(schema)
                return schema.parse({ _tag: value })
              },
            })
            .done()
          expect(A.decode($A)).toEqual(A.create())
        })
        it(`definition has access to the ADT name`, () => {
          const A = datum($A)
            .schema({ m: z.string() })
            .codec({
              encode: (data) => data.m,
              decode: (_value, { name }) => {
                expectType<typeof A.name>(name)
                return { m: name }
              },
            })
            .done()
          expect(A.decode(`m`)).toEqual(A.create({ m: A.name }))
        })
      })
      describe(`.encode()`, () => {
        it(`converts data into string`, () => {
          const m = B.create({ m: `m` })
          const encodeResult = B.encode(m)
          expectType<string>(encodeResult)
          expect(encodeResult).toEqual(`m`)
        })
      })
      describe(`.decodeOrThrow() `, () => {
        it(`converts string into data or throws error on failure`, () => {
          const decodeResult = B.decodeOrThrow(`m`)
          expectType<z.infer<typeof A.schema>>(decodeResult)
          expect(() => B.decodeOrThrow(``)).toThrowErrorMatchingInlineSnapshot(
            `"Failed to decode value \`\` into a A."`
          )
        })
      })
    })
  })
})

describe(`Controller`, () => {
  describe(`ADT API`, () => {
    it(`.schema points to a zod union schema combining all the defined datums`, () => {
      expect(A.schema.safeParse(``).success).toEqual(false)
      expectType<{ _tag: $A; m: string } | { _tag: $N; n: number }>(`` as unknown as z.infer<typeof A.schema>)
      expectType<z.infer<typeof A.schema>>(`` as unknown as z.infer<typeof A.schema>)
    })
    it(`.schema points to a zod object if only one datum is defined`, () => {
      const B = datum(`B`).schema({ m: z.string() }).done()
      expect(B.schema.safeParse(``).success).toEqual(false)
      expectType<{ _tag: 'B'; m: string }>(`` as unknown as z.infer<typeof B.schema>)
      expectType<z.infer<typeof B.schema>>(`` as unknown as z.infer<typeof B.schema>)
    })
  })

  describe(`datum API`, () => {
    it(`.symbol contains the unique symbol for this datum`, () => {
      expectType<symbol>(A.symbol)
      expect(typeof A.symbol).toBe(`symbol`)
    })

    it(`.name contains the name of the datum`, () => {
      expectType<$A>(A.name)
      expect(A.name).toBe($A)
      expectType<$A>(A.name)
      expect(A.name).toBe($A)
    })

    it(`.schema contains the zod schema for the datum`, () => {
      expectType<z.ZodSchema>(A.schema)
      expect(A.schema).toBeDefined()
      expect(A.schema.safeParse(``).success).toBe(false)
    })

    describe(`.create()`, () => {
      it(`If schema not given (aka. no properties), then constructor does not accept input`, () => {
        const A = datum($A).done()
        // @ts-expect-error: empty object still not like empty datum
        A.create({})
        expect(A.create()).toEqual({ _tag: $A, _: { symbol: A.symbol } })
        // eslint-disable-next-line
        expect((A as any).is({})).toEqual(false)
        expect(A.is$({})).toEqual(false)
      })
      it(`If schema only has optional properties then constructor input is optional`, () => {
        const A = datum($A).schema({ m: z.number().optional() }).done()
        A.create()
        A.create({})
        expect(A.create()).toEqual({ _tag: $A, _: { symbol: A.symbol } })
        expect(A.create({})).toEqual({ _tag: $A, _: { symbol: A.symbol } })
        expect(A.create({ m: 1 })).toEqual({ m: 1, _tag: $A, _: { symbol: A.symbol } })
      })
      it(`creates the datum`, () => {
        // @ts-expect-error: Invalid input
        A.create({ x: 1 })

        // @ts-expect-error: Input required
        A.create()

        // @ts-expect-error: Excess invalid input
        A.create({ m: `m`, n: 2 })

        const m = A.create({ m: `m` })
        expectType<{ _tag: $A; m: string }>(m)
        expect(m).toEqual({ _tag: $A, _: { symbol: A.symbol }, m: `m` })
      })
    })

    it(`.is() is a type guard / predicate function accepting only datums of the ADT`, () => {
      // @ts-expect-error: value is not an ADT datum.
      A.is(`whatever`)

      if (A.is(m)) expectType<typeof m>(m)

      expect(A.is(m)).toBe(true)
    })

    it(`.is$() is a type guard / predicate function accepting any value`, () => {
      const mMaybe = Math.random() > 0.5 ? m : false

      // Statically fine, any value may be checked here.
      A.is$(`whatever`)

      // @ts-expect-error The type has not being narrowed yet.
      expectType<typeof m>(mMaybe)

      if (A.is$(mMaybe)) expectType<typeof m>(mMaybe)
      if (!A.is$(mMaybe)) expectType<false>(mMaybe)

      expect(A.is$({})).toBe(false)
      expect(A.is$([])).toBe(false)
      expect(A.is$(null)).toBe(false)
      expect(A.is$(1)).toBe(false)
      expect(A.is$(m)).toBe(true)
      expect(A.is$({ _: null })).toBe(false)
      expect(A.is$({ _tag: $A, _: { symbol: A.symbol }, a: `` })).toBe(true)
      expect(A.is$({ _: { symbol: A.symbol } })).toBe(true)
    })
  })
})
