import { Alge } from '.'

describe(`.create()`, () => {
  describe(`errors`, () => {
    it(`call .done() without any variants`, () => {
      expect(() => Alge.create(`A`).done()).toThrowErrorMatchingInlineSnapshot(
        `"Alge User Mistake: No variants defined for ADT \`A\`."`
      )
    })
  })
  it(`Creates a new ADT`, () => {
    const name = `Foo`
    const Foo = Alge.create(name).variant(`Bar`).variant(`Qux`).done()
    expect(Foo.name).toBe(name)
  })
})
