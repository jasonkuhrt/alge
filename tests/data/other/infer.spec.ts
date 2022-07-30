import { Alge } from '../../../src/index.js'
import { $A, $B, AB } from '../../__helpers__.js'
import { expectType } from 'tsd'

it(`Can infer the ADT types from the runtime`, () => {
  expectType<Alge.Infer<typeof AB>>({
    [`*`]: { _tag: $A, m: `m` },
    A: { _tag: $A, m: `m` },
    B: { _tag: $B, n: 1 },
  })
})
