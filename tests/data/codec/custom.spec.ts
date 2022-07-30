import { Alge } from '../../../src/index.js'
import { $A, $AB } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`adds custom encoders to the controller`, () => {
  const AB = Alge.data($AB)
    .variant($A)
    .schema({ a: z.number() })
    .codec(`string`, {
      to: () => ``,
      from: (string) => ({ a: Number(string) }),
    })
    .done()

  type AB = Alge.Infer<typeof AB>
  expectType<(value: string) => null | AB['A']>(AB.A.from.string)
  expectType<(value: string) => AB['A']>(AB.A.from.stringOrThrow)

  const a = AB.A.create({ a: 1 })
  expect(AB.A.from.string(`1`)).toEqual(a)
  expect(AB.A.to.string(a)).toEqual(``)
})

describe(`encoder`, () => {
  describe(`builder`, () => {
    describe(`inputs`, () => {
      it(`1: data instance`, () => {
        type AB = Alge.Infer<typeof AB>
        const AB = Alge.data($AB)
          .variant($A)
          .schema({ a: z.number() })
          .codec(`foo`, {
            to: (data) => {
              expectType<AB['*']>(data)
              return `${data._tag}:${data.a}`
            },
            from: () => ({ a: 1 }),
          })
          .done()
        expect(AB.A.to.foo(AB.A.create({ a: 1 }))).toEqual(`A:1`)
      })
    })
    describe(`return`, () => {
      it(`string`, () => {
        Alge.data($AB)
          .variant($A)
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
      type AB = Alge.Infer<typeof AB>
      const AB = Alge.data($AB)
        .variant($A)
        .schema({ a: z.number() })
        .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
        .done()
      expectType<(data: AB['A']) => string>(AB.A.to.foo)
    })
  })
})

describe(`decoder`, () => {
  describe(`builder`, () => {
    describe(`inputs`, () => {
      it(`1: stringified value`, () => {
        const AB = Alge.data($AB)
          .variant($A)
          .schema({ a: z.number() })
          .codec(`string`, {
            to: () => ``,
            from: (string) => ({ a: Number(string) }),
          })
          .done()
        expect(AB.A.from.string(`100`)).toMatchObject({ a: 100 })
      })
      it(`2: context`, () => {
        const AB = Alge.data($AB)
          .variant($A)
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
        expect(AB.A.from.string(``)).toMatchObject({ a: [$A, AB.schema] })
      })
    })
    describe(`return`, () => {
      it(`value must adhere to schema`, () => {
        Alge.data($AB)
          .variant($A)
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
        const AB = Alge.data($AB)
          .variant($A)
          .schema({ a: z.number() })
          .codec(`string`, {
            to: () => ``,
            from: (string) => (string === `bad` ? null : { a: Number(string) }),
          })
          .done()

        expect(AB.A.from.string(`bad`)).toBeNull()
      })
    })
  })
  describe(`controller`, () => {
    const AB = Alge.data($AB)
      .variant($A)
      .schema({ a: z.number() })
      .codec(`string`, {
        to: () => ``,
        from: () => null,
      })
      .done()
    it(`input: requires string`, () => {
      // @ts-expect-error Requires string
      AB.A.from.string()
      // @ts-expect-error Requires string
      AB.A.from.string(1)
    })
    it(`has orThrow variant which throws when null is returned`, () => {
      expect(() => AB.A.from.stringOrThrow(``)).toThrowError()
    })
  })
})
