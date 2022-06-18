import { Alge } from '../../../src/index.js'
import { expectType } from 'tsd'
import { z } from 'zod'

const datum = Alge.datum
const $A = `A`
type $A = typeof $A
const A = datum($A).schema({ m: z.string() }).done()

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
    expect(() => (A as any).decode()).toThrowErrorMatchingInlineSnapshot(`"Codec not defined."`)
    expectType<never>(A.decodeOrThrow)
    //prettier-ignore
    //eslint-disable-next-line
    expect(() => (A as any).decodeOrThrow()).toThrowErrorMatchingInlineSnapshot(`"Codec not defined."`)
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
