import { Alge } from '../src/index.js'
import { z } from 'zod'

export const $A = `A`
export const $N = `N`

export type $A = typeof $A
export type $N = typeof $N

export const A = Alge.datum($A).schema({ m: z.string() }).done()
export const B = Alge.datum($A).schema({ n: z.number() }).done()

export type A = Alge.InferDatum<typeof A>
export type B = Alge.InferDatum<typeof A>

export const AB = Alge.data(`AB`).variant(A).variant(B).done()

export const m = A.create({ m: `m` })
