import { Alge } from '../../../src/index.js'
import { z } from 'zod'

it(`is not available in chain until after schema`, () => {
  // @ts-expect-error Codec not available until after schema
  Alge.datum(`A`).codec
  expect(
    // @ts-expect-error Testing
    // eslint-disable-next-line
    () => Alge.datum(`A`).codec(`abc`, { to: () => ``, from: () => ({}) })
  ).toThrowError(`A codec cannot be defined without a schema.`)
})

it(`is available in chain after schema`, () => {
  const A = Alge.datum(`A`)
    .schema({ a: z.number() })
    .codec(`abc`, { to: () => ``, from: () => ({ a: 1 }) })
    .done()
  expect(A).toBeDefined()
})

it(`multiple codecs can be defined`, () => {
  Alge.datum(`A`)
    .schema({ a: z.number() })
    .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
    .codec(`bar`, { to: () => ``, from: () => ({ a: 1 }) })
    .done()
})

it(`defining a codec with a name already taken by another codec throws a runtime error`, () => {
  expect(() =>
    Alge.datum(`A`)
      .schema({ a: z.number() })
      .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
      .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
  ).toThrowError(`A codec with the name "foo" has already been defined.`)
})
