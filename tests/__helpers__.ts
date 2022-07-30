import { Alge } from '../src/index.js'
import { z } from 'zod'

export const $A = `A`
export type $A = typeof $A
export const A = Alge.datum($A).schema({ m: z.string() }).done()
export type A = Alge.InferDatum<typeof A>

export const $B = `B`
export type $B = typeof $B
export const B = Alge.datum($B).schema({ n: z.number() }).done()
export type B = Alge.InferDatum<typeof B>

export const $AB = `AB`
export const AB = Alge.data($AB).variant(A).variant(B).done()
export type AB = Alge.Infer<typeof AB>

export const $N = `N`
export type $N = typeof $N

export const a = A.create({ m: `m` })
export const b = B.create({ n: 1 })
