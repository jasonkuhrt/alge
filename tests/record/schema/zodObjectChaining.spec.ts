import { Alge } from '../../../src/index.js'
import { $A } from '../../__helpers__.js'
import { expectType } from 'vite-plugin-vitest-typescript-assert/tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`can pass a ZodObject`, () => {
  const ShapeSchema = z.object({
    n: z.string(),
    m: z.number(),
  })

  const A = Alge.record($A).schema(ShapeSchema).done()

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
