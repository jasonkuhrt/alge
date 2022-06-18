import { Alge } from '../src/index.js'
import { z } from 'zod'

export const $A = `A`
export const $N = `N`

export type $A = typeof $A
export type $N = typeof $N

export const A = Alge.datum($A).schema({ m: z.string() }).done()

export const m = A.create({ m: `m` })
