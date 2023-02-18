import type { Alge } from '../../../src/index.js'
import type { AB } from '../../__helpers__.js'
import { $A, $B } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { it } from 'vitest'

it(`Can infer the ADT types from the runtime`, () => {
  expectType<Alge.Infer<typeof AB>>({
    [`*`]: { _tag: $A, m: `m` },
    A: { _tag: $A, m: `m` },
    B: { _tag: $B, n: 1 },
  })
})
