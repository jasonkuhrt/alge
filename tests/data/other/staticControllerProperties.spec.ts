import { data } from '../../../src/index_.js'
import { $A, $AB, $B } from '../../__helpers__.js'
import { expectType } from 'vite-plugin-vitest-typescript-assert/tsd'
import { expect, it } from 'vitest'

it(`The name is statically available.`, () => {
  const A = data($AB).record($A).record($B).done()
  expectType<typeof $AB>(A.name)
  expect(A.name).toBe($AB)
})
