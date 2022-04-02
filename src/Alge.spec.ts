import { Alge } from '.'
import { expectType } from 'tsd'
import { z } from 'zod'

const A = `A`
const N = `N`
const M = `M`

type A = typeof A
type N = typeof N
type M = typeof M

describe(`.create()`, () => {
  describe(`errors`, () => {
    it(`call .done() without any variants`, () => {
      const a = Alge.create(A)
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
    const a = Alge.create(A).variant(N).variant(M).done()
    expectType<typeof A>(a.name)
    expect(a.name).toBe(A)
  })
})

describe(`.variant()`, () => {
  it(`Can be given a name which becomes a static namespace on the ADT`, () => {
    const a = Alge.create(A).variant(M, { a: z.string() }).variant(N, { a: z.string() }).done()
    expect(a.M).toBeDefined()
    expect(a.N).toBeDefined()
  })
  describe(`namespace api`, () => {
    it(`The name of variant is statically known and available at runtime`, () => {
      const a = Alge.create(A).variant(M, { a: z.string() }).variant(N, { a: z.string() }).done()
      expectType<M>(a.M.name)
      expect(a.M.name).toBe(M)
    })
  })
})
