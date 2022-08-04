import { A } from '../../__helpers__.js'
import { expectType } from 'tsd'

it(`is a built in encoder`, () => {
  const a = A.create({ m: `m` })
  const a2 = A.to.json(a)
  expectType<string>(a2)
  expect(a2).toEqual(JSON.stringify(a))
})

it(`is a built in decoder`, () => {
  const a = A.create({ m: `m` })
  const a2 = A.from.json(A.to.json(a))
  expectType<null | A>(a2)
  expect(a2).toEqual(a)
})

describe(`is a built in throw-decoder`, () => {
  it(`can succeed`, () => {
    const a = A.create({ m: `m` })
    const a2 = A.from.jsonOrThrow(A.to.json(a))
    expectType<A>(a2)
    expect(a2).toEqual(a)
  })
  it(`can throw`, () => {
    expect(() => A.from.jsonOrThrow(`bad`)).toThrowError()
  })
})
