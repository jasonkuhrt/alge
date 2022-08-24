import { Alge } from '../../../src/index.js'
import { $A } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`adds custom encoders to the controller`, () => {
  const A = Alge.record($A)
    .schema({ a: z.number() })
    .codec(`string`, {
      to: () => ``,
      from: (string) => ({ a: Number(string) }),
    })
    .done()

  type A = Alge.InferRecord<typeof A>
  expectType<(value: string) => null | A>(A.from.string)
  expectType<(value: string) => A>(A.from.stringOrThrow)

  const a = A.create({ a: 1 })
  expect(A.from.string(`1`)).toEqual(a)
  expect(A.to.string(a)).toEqual(``)
})

describe(`encoder`, () => {
  describe(`builder`, () => {
    describe(`inputs`, () => {
      it(`1: data instance`, () => {
        type A = Alge.InferRecord<typeof A>
        const A = Alge.record($A)
          .schema({ a: z.number() })
          .codec(`foo`, {
            to: (data) => {
              expectType<A>(data)
              return `${data._tag}:${data.a}`
            },
            from: () => ({ a: 1 }),
          })
          .done()
        expect(A.to.foo(A.create({ a: 1 }))).toEqual(`A:1`)
      })
    })
    describe(`return`, () => {
      it(`string`, () => {
        Alge.record($A)
          .schema({ a: z.number() })
          .codec(`foo`, {
            // @ts-expect-error Must be a string
            to: () => 1,
            from: () => ({ a: 1 }),
          })
      })
    })
  })
  describe(`controller`, () => {
    it(`input: requires data`, () => {
      type A = Alge.InferRecord<typeof A>
      const A = Alge.record($A)
        .schema({ a: z.number() })
        .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
        .done()
      expectType<(data: A) => string>(A.to.foo)
    })
  })
})

describe(`decoder`, () => {
  describe(`builder`, () => {
    describe(`inputs`, () => {
      it(`1: stringified value`, () => {
        const A = Alge.record($A)
          .schema({ a: z.number() })
          .codec(`string`, {
            to: () => ``,
            from: (string) => ({ a: Number(string) }),
          })
          .done()
        expect(A.from.string(`100`)).toMatchObject({ a: 100 })
      })
      it(`2: context`, () => {
        const A = Alge.record($A)
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
        Alge.record($A)
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
      it(`defaults are applied`, () => {
        const A = Alge.record($A)
          .schema({ a: z.number().default(1) })
          .codec(`foo`, {
            to: () => ``,
            from: () => ({}),
          })
          .done()
        expect(A.from.foo(``)).toMatchObject({ a: 1 })
      })
      it(`null if decoding not possible`, () => {
        const A = Alge.record($A)
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
  describe(`controller`, () => {
    const A = Alge.record($A)
      .schema({ a: z.number() })
      .codec(`string`, {
        to: () => ``,
        from: () => null,
      })
      .done()
    it(`input: requires string`, () => {
      // @ts-expect-error Requires string
      A.from.string()
      // @ts-expect-error Requires string
      A.from.string(1)
    })
    it(`has orThrow record which throws when null is returned`, () => {
      expect(() => A.from.stringOrThrow(``)).toThrowError()
    })
  })
})
