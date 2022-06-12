import { A } from './__helpers__'
import { Alge } from '~/'
import { expectType } from 'tsd'

it(`Can infer the ADT types from the runtime`, () => {
  expectType<Alge.Infer<typeof A>>({
    [`*`]: { _tag: `M`, m: `m` },
    M: { _tag: `M`, m: `m` },
    N: { _tag: `N`, n: 1 },
  })
  expectType<Alge.Infer<typeof A>>({
    [`*`]: { _tag: `N`, n: 1 },
    M: { _tag: `M`, m: `m` },
    N: { _tag: `N`, n: 1 },
  })
})
