import { Alge } from '.'

describe(`.create()`, () => {
  describe(`errors`, () => {
    it(`call .done() without any variants`, () => {
      const adt = Alge.create(`A`)
      // @ts-expect-error .done is not statically available.
      // eslint-disable-next-line
      const done = adt.done
      // eslint-disable-next-line
      expect(done).toThrowErrorMatchingInlineSnapshot(
        `"Alge User Mistake: No variants defined for ADT \`A\` but \`.done()\` was called. You can only call \`.done()\` after your ADT has at least one variant defined (via \`.variant()\`)."`
      )
    })
  })
  it(`Creates a new ADT`, () => {
    const name = `Foo`
    const Foo = Alge.create(name).variant(`Bar`).variant(`Qux`).done()
    expect(Foo.name).toBe(name)
  })
})
