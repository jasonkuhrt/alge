import { Alge } from '../../../src/index.js'
import { $A, $AB } from '../../__helpers__.js'
import { z } from 'zod'

it(`is not available in chain until after a variant schema`, () => {
  // @ts-expect-error Codec not available until after variant and schema
  Alge.data($AB).codec
  // @ts-expect-error Codec not available until after variant and schema
  Alge.data($AB).variant($A).codec
  expect(
    // @ts-expect-error Testing
    // eslint-disable-next-line
    () => Alge.datum($AB).codec(`foo`, { to: () => ``, from: () => ({}) })
  ).toThrowError(`A codec cannot be defined without a schema.`)
})

it(`is available in chain after schema`, () => {
  const AB = Alge.data($AB)
    .variant($A)
    .schema({ a: z.number() })
    .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
    .done()
  expect(AB).toBeDefined()
})

it(`multiple codecs can be defined`, () => {
  Alge.data($AB)
    .variant($A)
    .schema({ a: z.number() })
    .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
    .codec(`bar`, { to: () => ``, from: () => ({ a: 1 }) })
    .done()
})

it(`defining a codec with a name already taken by another codec throws a runtime error`, () => {
  expect(() =>
    Alge.data($AB)
      .variant($A)
      .schema({ a: z.number() })
      .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
      .codec(`foo`, { to: () => ``, from: () => ({ a: 1 }) })
  ).toThrowError(`A codec with the name "foo" has already been defined.`)
})
