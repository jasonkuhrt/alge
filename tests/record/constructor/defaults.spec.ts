import { Alge } from '../../../src/index.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

const $A = `A`
const record = Alge.record

const A = record($A)
  .schema({ m: z.string(), n: z.number() })
  .defaults(() => ({ m: `m` }))
  .done()
it(`cannot be used before schema`, () => {
  // @ts-expect-error: defaults not available.
  // eslint-disable-next-line
  expect(() => record($A).defaults(() => ({}))).toThrowErrorMatchingInlineSnapshot(`"No schema defined."`)
})
it(`cannot be used twice`, () => {
  expect(() =>
    // eslint-disable-next-line
    record($A)
      .schema({ a: z.number() })
      .defaults(() => ({}))
      // @ts-expect-error: defaults not available.
      .defaults(() => ({}))
  ).toThrowErrorMatchingInlineSnapshot(`"Defaults already defined."`)
})
it(`provider return type must return correct type for properties`, () => {
  record($A)
    .schema({ m: z.string() })
    // @ts-expect-error: wrong property type
    .defaults(() => ({ m: 1 }))
})
it.todo(`provider returned defaults are validated`)
it(`provider returned object cannot contain only unknown properties`, () => {
  record($A)
    .schema({ m: z.string() })
    // @ts-expect-error: wrong property type
    .defaults(() => ({ unknown: 1 }))
})
// TODO forbid excess properties
it(`provider returned object can contain unknown properties if at least one is known`, () => {
  record($A)
    .schema({ m: z.string() })
    .defaults(() => ({ unknown: 1, m: `` }))
})
it(`a given default removes the need for the constructor to pass it`, () => {
  expect(A.create({ n: 1 })).toEqual({
    m: `m`,
    n: 1,
    _tag: $A,
    _: {
      symbol: A._.symbol,
      tag: $A,
    },
  })
})
it(`the constructor can override a given default`, () => {
  expect(A.create({ m: `something`, n: 1 })).toEqual({
    m: `something`,
    n: 1,
    _tag: $A,
    _: {
      tag: $A,
      symbol: A._.symbol,
    },
  })
})
it(`the constructor can pass an explicit undefined which is still overridden by the defaults`, () => {
  // @ts-expect-error ...
  // Strictest type checking prevents `undefined` to optional key without
  // presence of union. In this test we don't care. That type setting is particular to users'
  // projects. Here we're doing a runtime test.
  expect(A.create({ m: undefined, n: 1 })).toEqual({
    m: `m`,
    n: 1,
    _tag: $A,
    _: {
      symbol: A._.symbol,
      tag: $A,
    },
  })
})
it(`the defaults provider is available on the data constructor`, () => {
  expect(A._.defaultsProvider({})).toEqual({ m: `m` })
})
it(`the defaults provider is not available on the data constructor if no defaults were defined`, () => {
  const A = record($A).done()
  expectType<null>(A._.defaultsProvider)
  // @ts-expect-error: _.defaultsProvider is not a function.
  // eslint-disable-next-line
  expect(() => A._.defaultsProvider()).toThrowError()
})
