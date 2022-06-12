import { data, Infer } from './bulider'
import { SomeDecoder, SomeEncoder } from '~/datum/typesInternal'
import { datum } from '~/index_'
import { expectType } from 'tsd'
import { z } from 'zod'

const $A = `A`
const $N = `N`
const $M = `M`

type $A = typeof $A
type $N = typeof $N
type $M = typeof $M

const A = data($A).variant($M).schema({ m: z.string() }).variant($N).schema({ n: z.number() }).done()

const n = A.N.create({ n: 1 })

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
  const m = A.M.create({ m: `m` })
  const n = A.N.create({ n: 1 })
  it(`The name is statically available.`, () => {
    expectType<typeof $A>(A.name)
    expect(A.name).toBe($A)
  })
  it(`can construct variants`, () => {
    expectType<{ _tag: $M; m: `m` }>(m)
    expectType<{ _tag: $N; n: 1 }>(n)
    expect(m).toEqual({ _tag: $M, m: `m`, _: { symbol: A.M.symbol } })
    expect(n).toEqual({ _tag: $N, n: 1, _: { symbol: A.N.symbol } })
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
describe(`.extend()`, () => {
  it(`extends the ADT with properties`, () => {
    const A = data($A)
      .variant($M)
      .extend({ foo: 1 as const })
      .done()
    expectType<1>(A.M.foo)
    expect(A.M.foo).toBe(1)
  })
  // TODO make available to encoder as well.
  it(`extensions are available to decoder`, () => {
    const A = data($A)
      .variant($M)
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
    expectType<1>(A.M.foo)
    expect(A.M.foo).toBe(1)
  })
})
describe(`.codec()`, () => {
  const B = data($A)
    .variant($M)
    .schema({ m: z.string() })
    .codec({
      encode: (data) => data.m,
      decode: (data) => (data === `m` ? { m: data } : null),
    })
    .done()
  const m = B.M.create({ m: `m` })
  it(`cannot define codec multiple times in the chain`, () => {
    // eslint-disable-next-line
    const _A = data($A)
      .variant($M)
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
  describe(`Variant API`, () => {
    it(`if not defined then variant API codec methods not available`, () => {
      expectType<never>(A.M.encode)
      //eslint-disable-next-line
      expect(() => (A.M as any).encode()).toThrowErrorMatchingInlineSnapshot(`"Codec not implemented."`)
      expectType<never>(A.M.decode)
      //eslint-disable-next-line
      expect(() => (A.M as any).decode()).toThrowErrorMatchingInlineSnapshot(`"Codec not defined."`)
      expectType<never>(A.M.decodeOrThrow)
      //prettier-ignore
      //eslint-disable-next-line
      expect(() => (A.M as any).decodeOrThrow()).toThrowErrorMatchingInlineSnapshot(`"Codec not defined."`)
    })
    describe(`.decode()`, () => {
      it(`converts string into data or null on failure`, () => {
        const decodeResult = B.M.decode(`m`)
        expectType<null | z.infer<typeof A.M.schema>>(decodeResult)
        expect(B.M.decode(`m`)).toEqual(m)
        expect(B.M.decode(``)).toEqual(null)
      })
      it(`definition has access to the ADT schema`, () => {
        const A = data(`A`)
          .variant(`M`)
          .schema({ m: z.string() })
          .codec({
            encode: (data) => data.m,
            decode: (value, { schema }) => {
              expectType<typeof A.M.schema>(schema)
              return schema.parse({ m: value, _tag: $M })
            },
          })
          .done()
        expect(A.M.decode(`m`)).toEqual(A.M.create({ m: `m` }))
      })
      it(`definition has access to the ADT schema even if no schema defined`, () => {
        const A = data($A)
          .variant($M)
          .codec({
            encode: (data) => data._tag,
            decode: (value, { schema }) => {
              expectType<typeof A.M.schema>(schema)
              return schema.parse({ _tag: value })
            },
          })
          .done()
        expect(A.M.decode($M)).toEqual(A.M.create())
      })
      it(`definition has access to the ADT name`, () => {
        const A = data($A)
          .variant($M)
          .schema({ m: z.string() })
          .codec({
            encode: (data) => data.m,
            decode: (_value, { name }) => {
              expectType<typeof A.M.name>(name)
              return { m: name }
            },
          })
          .done()
        expect(A.M.decode(`m`)).toEqual(A.M.create({ m: A.M.name }))
      })
    })
    describe(`.encode()`, () => {
      it(`converts data into string`, () => {
        const m = B.M.create({ m: `m` })
        const encodeResult = B.M.encode(m)
        expectType<string>(encodeResult)
        expect(encodeResult).toEqual(`m`)
      })
    })
    describe(`.decodeOrThrow() `, () => {
      it(`converts string into data or throws error on failure`, () => {
        const decodeResult = B.M.decodeOrThrow(`m`)
        expectType<z.infer<typeof A.M.schema>>(decodeResult)
        expect(() => B.M.decodeOrThrow(``)).toThrowErrorMatchingInlineSnapshot(
          // TODO
          // `"Failed to decode value \`\` into a \`B.M\`."`
          `"Failed to decode value \`\` into a M."`
        )
      })
    })
  })

  describe(`ADT API`, () => {
    it(`If defined for every variant then an aggregate codec is available on the ADT`, () => {
      const A = data($A)
        .variant($M)
        .schema({ m: z.string() })
        .codec({
          encode: (data) => data.m,
          decode: (data) => (data === `m` ? { m: data } : null),
        })
        .variant($N)
        .schema({ n: z.number() })
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
      expectType<never>(A.decodeOrThrow)
      // @ts-expect-error: codec not defined for every variant.
      // eslint-disable-next-line
      expect(() => A.decodeOrThrow('m')).toThrowErrorMatchingInlineSnapshot(
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

describe(`.Infer<>`, () => {
  it(`Can infer the ADT types from the runtime`, () => {
    expectType<Infer<typeof A>>({
      [`*`]: { _tag: `M`, m: `m` },
      M: { _tag: `M`, m: `m` },
      N: { _tag: `N`, n: 1 },
    })
    expectType<Infer<typeof A>>({
      [`*`]: { _tag: `N`, n: 1 },
      M: { _tag: `M`, m: `m` },
      N: { _tag: `N`, n: 1 },
    })
  })
})
