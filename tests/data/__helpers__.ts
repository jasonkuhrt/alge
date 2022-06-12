import { Alge } from '~/'
import { z } from 'zod'

export const $A = `A`
export const $N = `N`
export const $M = `M`

export type $A = typeof $A
export type $N = typeof $N
export type $M = typeof $M

export const A = Alge.data($A)
  .variant($M)
  .schema({ m: z.string() })
  .variant($N)
  .schema({ n: z.number() })
  .done()

export const m = A.M.create({ m: `m` })
