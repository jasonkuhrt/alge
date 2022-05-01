import { datum } from './builder'
import { expectType } from 'tsd'
import { z } from 'zod'

const $A = `A`
const $N = `N`
// const $M = `M`

type $A = typeof $A
type $N = typeof $N
// type $M = typeof $M

const A = datum($A).schema({ m: z.string() }).done()

const m = A.create({ m: `m` })
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
