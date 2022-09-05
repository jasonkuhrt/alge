import { Alge } from '../../../src/index.js'
import { $A } from '../../__helpers__.js'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`input is validated`, () => {
  expect(() =>
    Alge.record($A, {
      a: z.number().int(),
    }).create({ a: 1.5 })
  ).toThrowError()
})
