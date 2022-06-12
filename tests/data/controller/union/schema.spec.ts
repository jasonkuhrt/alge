import { $M, $N, A } from '../../__helpers__'
import { data } from '~/index_'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`.schema points to a zod union schema combining all the defined variants`, () => {
  expect(A.schema.safeParse(``).success).toEqual(false)
  expectType<{ _tag: $M; m: string } | { _tag: $N; n: number }>(`` as unknown as z.infer<typeof A.schema>)
  expectType<z.infer<typeof A.M.schema> | z.infer<typeof A.N.schema>>(
    `` as unknown as z.infer<typeof A.schema>
  )
})
it(`.schema points to a zod object if only one variant is defined`, () => {
  const B = data(`B`).variant($M).schema({ m: z.string() }).done()
  expect(B.schema.safeParse(``).success).toEqual(false)
  expectType<{ _tag: $M; m: string }>(`` as unknown as z.infer<typeof B.schema>)
  expectType<z.infer<typeof B.M.schema>>(`` as unknown as z.infer<typeof B.schema>)
})
