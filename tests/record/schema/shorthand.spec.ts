import { Alge } from '../../../src/index.js'
import { $A } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`a shorthand for creating basic records`, () => {
  const A = Alge.record($A, {
    n: z.string(),
    m: z.number(),
  })

  const A2 = Alge.record($A)
    .schema({
      n: z.string(),
      m: z.number(),
    })
    .done()

  expectType<typeof A2>(A)
  expectType<typeof A>(A2)

  expect(A.create({ n: ``, m: 1 })).toMatchObject({ _tag: `A`, n: ``, m: 1 })
})
