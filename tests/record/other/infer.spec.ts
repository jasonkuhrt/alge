import { Alge } from '../../../src/index.js'
import { $A, A } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { it } from 'vitest'

it(`Can infer the ADT types from the runtime`, () => {
  expectType<Alge.InferRecord<typeof A>>({ _tag: $A, m: `m` })
})
