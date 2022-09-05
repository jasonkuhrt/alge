import { Alge } from '../../../src/index.js'
import { A, a } from '../../__helpers__.js'
import { expectType } from 'vite-plugin-vitest-typescript-assert/tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`updates record by copy`, () => {
  // eslint-disable-next-line
  expectType<(data: A, changes: Partial<A>) => A>(A.update)
  const a_ = A.update(a, { m: `updated` })
  expect(a).toMatchObject({ m: `m` })
  expect(a_).not.toBe(a)
  expect(a_).toEqual({ _tag: `A`, m: `updated`, _: { tag: `A`, symbol: A._.symbol } })
})

it(`updates triggers validate etc.`, () => {
  const A = Alge.record(`A`, {
    m: z.string().regex(/abc/),
  })
  const a = A.create({ m: `abc` })
  expect(() => A.update(a, { m: `updated` })).toThrowErrorMatchingInlineSnapshot(`
    "[
      {
        \\"validation\\": \\"regex\\",
        \\"code\\": \\"invalid_string\\",
        \\"message\\": \\"Invalid\\",
        \\"path\\": [
          \\"m\\"
        ]
      }
    ]"
  `)
})
