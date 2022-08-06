import { Alge } from '../src/index.js'
import { z } from 'zod'

export const $A = `A`
export type $A = typeof $A
export const A = Alge.record($A).schema({ m: z.string() }).done()
export type A = Alge.InferRecord<typeof A>

export const $B = `B`
export type $B = typeof $B
export const B = Alge.record($B).schema({ n: z.number() }).done()
export type B = Alge.InferRecord<typeof B>

export const $AB = `AB`
export const AB = Alge.data($AB).record(A).record(B).done()
export type AB = Alge.Infer<typeof AB>

export const $N = `N`
export type $N = typeof $N

export const a = A.create({ m: `m` })
export const b = B.create({ n: 1 })
export const ab = Math.random() > 0.5 ? a : b
export type ab = typeof ab
export type a = typeof a
export type b = typeof b
