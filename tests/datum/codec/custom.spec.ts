import { Alge } from '../../../src/index.js'
import { $A } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`adds custom encoders to the controller`, () => {
  const A = Alge.datum($A)
    .schema({ a: z.number() })
    .codec(`string`, {
      to: () => ``,
      from: (string) => ({ a: Number(string) }),
    })
    .done()

  type A = Alge.InferDatum<typeof A>
  expectType<(value: string) => null | A>(A.from.string)
  expectType<(value: string) => A>(A.from.stringOrThrow)

  const a = A.create({ a: 1 })
  expect(A.from.string(`1`)).toEqual(a)
  expect(A.to.string(a)).toEqual(``)
})

describe(`encoder`, () => {
  describe(`inputs`, () => {
    it(`1: data instance`, () => {
      const A = Alge.datum($A)
        .schema({ a: z.number() })
        .codec(`foo`, {
          to: (data) => `${data._tag}:${data.a}`,
          from: () => ({ a: 1 }),
        })
        .done()
      expect(A.to.foo(A.create({ a: 1 }))).toEqual(`A:1`)
    })
  })
  describe(`return`, () => {
    it(`string`, () => {
      Alge.datum($A)
        .schema({ a: z.number() })
        .codec(`foo`, {
          // @ts-expect-error Must be a string
          to: () => 1,
          from: () => ({ a: 1 }),
        })
    })
  })
})

describe(`decoder`, () => {
  describe(`inputs`, () => {
    it(`1: stringified value`, () => {
      const A = Alge.datum($A)
        .schema({ a: z.number() })
        .codec(`string`, {
          to: () => ``,
          from: (string) => ({ a: Number(string) }),
        })
        .done()
      expect(A.from.string(`100`)).toMatchObject({ a: 100 })
    })
    it(`2: context`, () => {
      const A = Alge.datum($A)
        .schema({ a: z.array(z.any()) })
        .codec(`string`, {
          to: () => ``,
          from: (_, context) => {
            expectType<$A>(context.name)
            expectType<z.AnyZodObject>(context.schema)
            return { a: [context.name, context.schema] }
          },
        })
        .done()
      expect(A.from.string(``)).toMatchObject({ a: [$A, A.schema] })
    })
  })
  describe(`return`, () => {
    it(`value must adhere to schema`, () => {
      Alge.datum($A)
        .schema({ a: z.number() })
        .codec(`foo`, {
          to: () => ``,
          // @ts-expect-error return does not conform to schema.
          from: () => ({ b: 1 }),
        })
        .codec(`bar`, {
          to: () => ``,
          // @ts-expect-error return does not conform to schema.
          from: () => ({}),
        })
    })
    it(`null if decoding not possible`, () => {
      const A = Alge.datum($A)
        .schema({ a: z.number() })
        .codec(`string`, {
          to: () => ``,
          from: (string) => (string === `bad` ? null : { a: Number(string) }),
        })
        .done()

      expect(A.from.string(`bad`)).toBeNull()
    })
  })
})
