import { Alge } from '~/'
import { expectType } from 'tsd'
import { z } from 'zod'

const $A = `A`
const datum = Alge.datum

const A = datum($A)
  .schema({ m: z.string(), n: z.number() })
  .defaults(() => ({ m: `m` }))
  .done()
it(`cannot be used before schema`, () => {
  // @ts-expect-error: defaults not available.
  // eslint-disable-next-line
  expect(() => datum($A).defaults(() => ({}))).toThrowErrorMatchingInlineSnapshot(`"No schema defined."`)
})
it(`cannot be used twice`, () => {
  expect(() =>
    // eslint-disable-next-line
    datum($A)
      .schema({ a: z.number() })
      .defaults(() => ({}))
      // @ts-expect-error: defaults not available.
      .defaults(() => ({}))
  ).toThrowErrorMatchingInlineSnapshot(`"Defaults already defined."`)
})
it(`provider return type must return correct type for properties`, () => {
  datum($A)
    .schema({ m: z.string() })
    // @ts-expect-error: wrong property type
    .defaults(() => ({ m: 1 }))
})
it.todo(`provider returned defaults are validated`)
it(`provider returned object cannot contain only unknown properties`, () => {
  datum($A)
    .schema({ m: z.string() })
    // @ts-expect-error: wrong property type
    .defaults(() => ({ unknown: 1 }))
})
// TODO forbid excess properties
it(`provider returned object can contain unknown properties if at least one is known`, () => {
  datum($A)
    .schema({ m: z.string() })
    .defaults(() => ({ unknown: 1, m: `` }))
})
it(`a given default removes the need for the constructor to pass it`, () => {
  expect(A.create({ n: 1 })).toEqual({
    m: `m`,
    n: 1,
    _tag: $A,
    _: {
      symbol: A.symbol,
    },
  })
})
it(`the constructor can override a given default`, () => {
  expect(A.create({ m: `something`, n: 1 })).toEqual({
    m: `something`,
    n: 1,
    _tag: $A,
    _: {
      symbol: A.symbol,
    },
  })
})
it(`the constructor can pass an explicit undefined which is still overriden by the defaults`, () => {
  expect(A.create({ m: undefined, n: 1 })).toEqual({
    m: `m`,
    n: 1,
    _tag: $A,
    _: {
      symbol: A.symbol,
    },
  })
})
it(`the defaults provider is available on the data constructor`, () => {
  expect(A._.defaultsProvider({})).toEqual({ m: `m` })
})
it(`the defaults provider is not available on the data constructor if no defaults were defined`, () => {
  const A = datum($A).done()
  expectType<null>(A._.defaultsProvider)
  // @ts-expect-error: _.defaultsProvider is not a function.
  // eslint-disable-next-line
  expect(() => A._.defaultsProvider()).toThrowError()
})
