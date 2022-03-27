import { Alge } from '.'

describe(`.create()`, () => {
  it(`Creates a new ADT`, () => {
    const name = `Foo`
    const Foo = Alge.create(name).member(`Bar`).member(`Qux`).done()
    expect(Foo.name).toBe(name)
  })
})
