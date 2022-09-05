import { Alge } from '../../../src/index.js'
import { $A } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`static default on a field makes it optional in the constructor`, () => {
  const A = Alge.record($A, {
    a: z.number().default(0),
  })

  // eslint-disable-next-line
  expectType<(input: { a?: undefined | number }) => { a: number; _tag: $A }>(A.create)

  expect(A.create()).toMatchObject({ a: 0, _tag: `A` })
  expect(A.create({})).toMatchObject({ a: 0, _tag: `A` })
  expect(A.create({ a: 1 })).toMatchObject({ a: 1, _tag: `A` })
})

it(`dynamic default on a field makes optional in the constructor`, () => {
  let counter = 0
  const A = Alge.record($A, {
    a: z.number().default(() => ++counter),
  })

  // eslint-disable-next-line
  expectType<(input: { a?: undefined | number }) => { a: number; _tag: $A }>(A.create)

  expect(A.create()).toMatchObject({ a: 1, _tag: `A` })
  expect(A.create({})).toMatchObject({ a: 2, _tag: `A` })
  expect(A.create({ a: 0 })).toMatchObject({ a: 0, _tag: `A` })
})
