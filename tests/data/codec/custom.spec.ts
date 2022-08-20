import { Alge } from '../../../src/index.js'
import { $A, $AB, $B } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`adds custom encoders to the controller`, () => {
  const AB = Alge.data($AB)
    .record($A)
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
          .record($A)
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
          .record($A)
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
        .record($A)
        .schema({ a: z.number() })
        .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
        .done()
      expectType<(data: AB['A']) => string>(AB.A.to.foo)
    })
    it(`two codecs works`, () => {
      const Shape = Alge.data(`Shape`)
        .record(`Square`)
        .schema({
          size: z.number().default(0),
        })
        .codec(`graphic`, {
          to: () => ``,
          from: () => ({ size2: 1 }),
        })
        .codec(`somethingElse`, {
          to: () => `todo`,
          from: () => ({ size2: 0 }),
        })
        .done()

      expectType<(input: { _tag: 'Square'; size: number }) => string>(Shape.Square.to.graphic)
      expectType<(input: { _tag: 'Square'; size: number }) => string>(Shape.Square.to.somethingElse)

      const s = Shape.Square.create({ size: 1 })
      expect(Shape.Square.to.graphic(s)).toEqual(``)
      expect(Shape.Square.to.somethingElse(s)).toEqual(``)
    })
    describe(`ADT level`, () => {
      it(`common encoders are available`, () => {
        type AB = Alge.Infer<typeof AB>
        const AB = Alge.data($AB)
          .record($A)
          .schema({ a: z.number() })
          .codec(`foo`, { to: (a) => a.a.toString(), from: () => ({ a: 1 }) })
          .record($B)
          .schema({ b: z.number() })
          .codec(`foo`, { to: (b) => b.b.toString(), from: () => ({ b: 1 }) })
          .done()

        expectType<(data: AB['*']) => string>(AB.to.foo)

        const aOrB = Math.random() > 0.5 ? AB.A.create({ a: 1 }) : AB.B.create({ b: 2 })
        expect(AB.to.foo(aOrB)).toMatch(/1|2/)

        // @ts-expect-error Test runtime error
        expect(() => AB.to.foo({})).toThrowError(`Failed to find an encoder for data: "{}"`)
      })
    })
  })
})

describe(`decoder`, () => {
  describe(`builder`, () => {
    describe(`inputs`, () => {
      it(`1: stringified value`, () => {
        const AB = Alge.data($AB)
          .record($A)
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
          .record($A)
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
          .record($A)
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
          .record($A)
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
      .record($A)
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
    it(`has orThrow record which throws when null is returned`, () => {
      expect(() => AB.A.from.stringOrThrow(``)).toThrowError()
    })
    describe(`ADT level`, () => {
      it(`common decoders are available`, () => {
        type AB = Alge.Infer<typeof AB>
        const AB = Alge.data($AB)
          .record($A)
          .schema({ a: z.number() })
          .codec(`foo`, {
            to: (a) => a.a.toString(),
            from: (string) => (string.startsWith(`A:`) ? { a: 1 } : null),
          })
          .record($B)
          .schema({ b: z.number() })
          .codec(`foo`, {
            to: (b) => b.b.toString(),
            from: (string) => (string.startsWith(`B:`) ? { b: 2 } : null),
          })
          .done()

        expectType<(string: string) => null | AB['*']>(AB.from.foo)

        const a = AB.A.create({ a: 1 })
        const b = AB.B.create({ b: 2 })
        expect(AB.from.foo(`A:`)).toEqual(a)
        expect(AB.from.foo(`B:`)).toEqual(b)
        expect(AB.from.foo(``)).toEqual(null)

        expectType<(string: string) => AB['*']>(AB.from.fooOrThrow)
        expect(() => AB.from.fooOrThrow(``)).toThrowError(
          `Failed to decode value \`''\` into any of the records for this ADT.`
        )
      })
    })
  })
})
