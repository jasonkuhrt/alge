import { Alge } from '../../../src/index.js'
import { expectType } from 'vite-plugin-vitest-typescript-assert/tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`supports shorthand`, () => {
  const AB = Alge.data(`AB`, {
    A: { a: z.string() },
    B: { b: z.string() },
  })
  const AB2 = Alge.data(`AB`)
    .record(`B`)
    .schema({ b: z.string() })
    .record(`A`)
    .schema({ a: z.string() })
    .done()

  expectType<typeof AB2>(AB)
  expectType<typeof AB>(AB2)

  expect(AB.A.create({ a: `` })).toMatchObject({ _tag: `A`, a: `` })
  expect(AB.B.create({ b: `` })).toMatchObject({ _tag: `B`, b: `` })
})
