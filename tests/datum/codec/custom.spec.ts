import { Alge } from '../../../src/index.js'
import { expectType } from 'tsd'

it(`is a built in encoder`, () => {
  const A = Alge.datum(`A`)
    .codec(`string`, {
      to: () => ``,
      from: () => ({}),
    })
    .done()

  type A = Alge.InferDatum<typeof A>
  expectType<(value: string) => null | A>(A.from.string)
  expectType<(value: string) => A>(A.from.stringOrThrow)

  const a = A.create()
  expect(A.from.string(``)).toEqual(a)
  expect(A.to.string(a)).toEqual(``)
})
