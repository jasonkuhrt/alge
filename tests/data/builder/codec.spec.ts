import { $A, $M, $N, A } from '../__helpers__'
import { data } from '~/index_'
import { expectType } from 'tsd'
import { z } from 'zod'

const n = A.N.create({ n: 1 })

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
