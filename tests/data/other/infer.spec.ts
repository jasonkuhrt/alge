import { Infer } from '../../../src/index_.js'
import { $M, $N, A } from '../__helpers__.js'
import { expectType } from 'tsd'

it(`Can infer the ADT types from the runtime`, () => {
  expectType<Infer<typeof A>>({
    [`*`]: { _tag: $M, m: `m` },
    M: { _tag: $M, m: `m` },
    N: { _tag: $N, n: 1 },
  })
  expectType<Infer<typeof A>>({
    [`*`]: { _tag: $N, n: 1 },
    M: { _tag: $M, m: `m` },
    N: { _tag: $N, n: 1 },
  })
})
