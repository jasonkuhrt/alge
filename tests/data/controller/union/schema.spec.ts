import { Alge } from '../../../../src/index.js'
import { $A, $AB, $B, AB } from '../../../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`.schema points to a zod union schema combining all the defined records`, () => {
  expect(AB.schema.safeParse(``).success).toEqual(false)
  expectType<{ _tag: $A; m: string } | { _tag: $B; n: number }>(`` as unknown as z.infer<typeof AB.schema>)
  expectType<z.infer<typeof AB.A.schema> | z.infer<typeof AB.B.schema>>(
    `` as unknown as z.infer<typeof AB.schema>
  )
})
it(`.schema points to a zod object if only one record is defined`, () => {
  const AB = Alge.data($AB).record($A).schema({ m: z.string() }).done()
  expect(AB.schema.safeParse(``).success).toEqual(false)
  expectType<{ _tag: $A; m: string }>(`` as unknown as z.infer<typeof AB.schema>)
  expectType<z.infer<typeof AB.A.schema>>(`` as unknown as z.infer<typeof AB.schema>)
})
