import { Alge } from '.'
import { expectType } from 'tsd'
import { z } from 'zod'

const $A = `A`
const $N = `N`
const $M = `M`

type A = typeof $A
type N = typeof $N
type M = typeof $M

describe(`.create()`, () => {
  describe(`errors`, () => {
    it(`call .done() without any variants`, () => {
      const a = Alge.create($A)
      // @ts-expect-error .done is not statically available.
      // eslint-disable-next-line
      const done = a.done
      // eslint-disable-next-line
      expect(done).toThrowErrorMatchingInlineSnapshot(
        `"Alge User Mistake: No variants defined for ADT \`A\` but \`.done()\` was called. You can only call \`.done()\` after your ADT has at least one variant defined (via \`.variant()\`)."`
      )
    })
  })
  it(`The name is statically available.`, () => {
    const A = Alge.create($A).variant($N).variant($M).done()
    expectType<typeof $A>(A.name)
    expect(A.name).toBe($A)
  })
})

describe(`.variant()`, () => {
  it(`Can be given a name which becomes a static namespace on the ADT`, () => {
    const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
    expect(A.M).toBeDefined()
    expect(A.N).toBeDefined()
  })
  describe(`namespace api`, () => {
    it(`The name of variant is statically known and available at runtime`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
      expectType<M>(A.M.name)
      expect(A.M.name).toBe($M)
    })
    it(`.create()`, () => {
      const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()

      const m = A.M.create({ a: `x` })
      expectType<{ _tag: `M`; a: string }>(m)
      expect(m).toEqual({ _tag: `M`, a: `x` })

      const n = A.N.create({ a: `x` })
      expectType<{ _tag: `N`; a: string }>(n)
      expect(n).toEqual({ _tag: `N`, a: `x` })
    })
    // it('.is$() is a type guard / predicate function', () => {
    //   const A = Alge.create($A).variant($M, { a: z.string() }).variant($N, { a: z.string() }).done()
    //   const m = A.M.create({ a: `x` })
    //   expect(A.M.is$(1)).toBe(false)
    //   expect(A.M.is$(m)).toBe(true)
    // })
  })
})
