import { AB } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { describe, expect, it } from 'vitest'

const a = AB.A.create({ m: `m` })

it(`is a built in encoder`, () => {
  const a2 = AB.A.to.json(a)
  expectType<string>(a2)
  expect(a2).toEqual(JSON.stringify(a))
})

it(`is a built in decoder`, () => {
  const a2 = AB.A.from.json(AB.A.to.json(a))
  expectType<null | AB['A']>(a2)
  expect(a2).toEqual(a)
})

describe(`is a built in throw-decoder`, () => {
  it(`can succeed`, () => {
    const a2 = AB.A.from.jsonOrThrow(AB.A.to.json(a))
    expectType<AB['A']>(a2)
    expect(a2).toEqual(a)
  })
  it(`can throw`, () => {
    expect(() => AB.A.from.jsonOrThrow(`bad`)).toThrowError()
  })
})

describe(`ADT level`, () => {
  it(`decode`, () => {
    const a2 = AB.from.json(AB.A.to.json(a))
    expectType<AB['*'] | null>(a2)
    expect(a2).toEqual(a)
    const a3 = AB.from.json(`bad`)
    expect(a3).toEqual(null)
  })
  it(`decode or throw`, () => {
    const a2 = AB.from.jsonOrThrow(AB.A.to.json(a))
    expectType<AB['*']>(a2)
    expect(a2).toEqual(a)
    expect(() => AB.from.jsonOrThrow(`bad`)).toThrow()
  })
  it(`encode`, () => {
    const a2 = AB.from.json(AB.A.to.json(a))
    expectType<AB['*'] | null>(a2)
    expect(a2).toEqual(a)
  })
})
