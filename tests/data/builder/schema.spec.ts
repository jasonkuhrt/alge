import { Alge } from '../../../src/index.js'
import { $AB } from '../../__helpers__.js'
import { expectType } from 'tsd'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`zod object schemas can be passed into shorthand builder`, () => {
  const A = z.object({ m: z.string() })
  const B = z.object({ n: z.number() })
  const AB = Alge.data($AB, { A, B })

  const AB2 = Alge.data($AB)
    .record(`B`)
    .schema({ n: z.number() })
    .record(`A`)
    .schema({ m: z.string() })
    .done()

  expectType<typeof AB2>(AB)
  expect(AB.A.create({ m: `` })).toMatchObject({ _tag: `A`, m: `` })
})

it(`zod object schemas can be passed into chain builder`, () => {
  const A = z.object({ m: z.string() })
  const B = z.object({ n: z.number() })
  const AB = Alge.data($AB).record(`B`).schema(B).record(`A`).schema(A).done()

  const AB2 = Alge.data($AB)
    .record(`B`)
    .schema({ n: z.number() })
    .record(`A`)
    .schema({ m: z.string() })
    .done()

  expectType<typeof AB2>(AB)
  expect(AB.A.create({ m: `` })).toMatchObject({ _tag: `A`, m: `` })
})
