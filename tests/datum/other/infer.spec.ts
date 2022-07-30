import { Alge } from '../../../src/index.js'
import { $A, A } from '../../__helpers__.js'
import { expectType } from 'tsd'

it(`Can infer the ADT types from the runtime`, () => {
  expectType<Alge.InferDatum<typeof A>>({ _tag: $A, m: `m` })
})
