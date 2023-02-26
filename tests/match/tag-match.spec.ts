/* eslint-disable */
import { Alge } from '../../src/index.js'
import { expectType } from 'tsd'
import { describe, expect, it } from 'vitest'
import { I } from 'ts-toolbelt'

type B = 'B'
type A = 'A'
type Tag = A | B
const tagA = 'A' as Tag
const tagB = 'B' as Tag

const cast = <T>(): T => 0 as any

describe('accepted tag properties', () => {
  it(`_tag`, () => {
    type adt = { _tag: 'A'; a: 0 } | { _tag: 'B'; b: '' }
    // prettier-ignore
    const adts = [{ _tag: 'A', a: 0 }, { _tag: 'B', b: '' }] as const //satisfies [adt,...adt[]]
    const adt = adts[Math.floor(Math.random() * adts.length)]!
    const builder = Alge.match(adt)
    expect(typeof builder.A).toBe(`function`)
    expect(typeof builder.B).toBe(`function`)
    expectType<(handler: (data: { b: '' }) => unknown) => any>(builder.B)
    const builder2 = builder.A(() => 'a')
    // @ts-expect-error tag is omitted
    builder2.B({ _tag: 'B' }, () => {})
  })
  it(`__typename`, () => {
    type adt = { __typename: 'A'; a: 0 } | { __typename: 'B'; b: '' }
    // prettier-ignore
    const adts = [{ __typename: 'A', a: 0 }, { __typename: 'B', b: '' }] as const //satisfies [adt,...adt[]]
    const adt = adts[Math.floor(Math.random() * adts.length)]!
    const builder = Alge.match(adt)
    expect(typeof builder.A).toBe(`function`)
    expect(typeof builder.B).toBe(`function`)
    expectType<(handler: (data: { a: 0 }) => unknown) => any>(builder.A)
    expectType<(handler: (data: { b: '' }) => unknown) => any>(builder.B)
    const builder2 = builder.A(() => 'a')
    expect(typeof builder2.B).toBe(`function`)
    // @ts-expect-error tag is omitted
    builder2.B({ __typename: 'B' }, () => {})
    builder2.B((data) => {
      expectType<typeof data>(cast<{ __typename: 'B'; b: '' }>())
    })
    // TODO make this possible but having Match be immutable
    // // @ts-expect-error tag is omitted
    // builder2.B({ __typename: 'B' }, () => {})
  })
})

it(`returns a Match Builder, an object with methods named according to the possible tags`, () => {
  const builder = Alge.match(tagA)
  expect(typeof builder.A).toBe(`function`)
  expect(typeof builder.B).toBe(`function`)
  expectType<(handler: () => unknown) => any>(builder.A)
  expectType<(handler: () => unknown) => any>(builder.B)
})

describe(`.<tag> (Tag Matcher)`, () => {
  describe(`after a tag matcher`, () => {
    it(`cannot match the same tag again`, () => {
      const builder = Alge.match(tagA).A(() => 1)

      // @ts-expect-error Already defined
      expect(() => builder.A(() => 1)).toThrowErrorMatchingInlineSnapshot(`"A has already been matched on."`)
    })
    it(`can match another tag`, () => {
      const builder = Alge.match(tagA).A(() => 1 as const)
      expectType<(handler: () => unknown) => any>(builder.B)
      expect(typeof builder.B).toBe(`function`)
    })
  })
})

describe(`.<tag> (Data Matcher)`, () => {
  it('is not available', () => {
    const builder = Alge.match(tagA)
    // @ts-expect-error
    builder.A({ x: 'foo' }, (data) => 1)
  })
})

describe(`.else`, () => {
  it('does not receive tag X when a data matcher for X has been set', () => {
    const builder = Alge.match(tagA).A(() => 1)
    builder.else((tag) => expectType<'B'>(tag))
  })
  it(`not available if no matchers have been defined`, () => {
    const builder = Alge.match(tagA)
    // @ts-expect-error Not available yet.
    builder.else
    // @ts-expect-error ^^^
    expect(builder.else).toBeUndefined()
  })
  it(`not available if all tag matchers have been defined`, () => {
    const builder = Alge.match(tagA)
      .A(() => 1)
      .B(() => 2)
    // @ts-expect-error Not available yet.
    builder.else
    // @ts-expect-error ...
    // But we cannot enforce this at runtime since runtime does not
    // know the number of union members in the static type.
    expect(builder.else).toBeDefined()
  })
  it(`is available if some but not all tag matchers have been defined`, () => {
    const builder = Alge.match(tagA).A(() => 1 as const)
    expectType<typeof builder.else>(
      0 as any as <ThisResult>(value: ThisResult | ((tags: B) => ThisResult)) => ThisResult | 1
    )
    expect(builder.else).toBeDefined()
  })
  it(`executes the matcher and returns else value if no matcher matched`, () => {
    const builderA = Alge.match(tagA).A(() => 1 as const)
    expect(builderA.else(null)).toBe(1)
    const builderB = Alge.match(tagB).A(() => 2 as const)
    expect(builderB.else(null)).toBeNull()
  })
  describe(`lazy value`, () => {
    it(`if else value is a function then it is considered a lazy value`, () => {
      const builder = Alge.match(tagB).A(() => 1)
      expect(builder.else(() => 2)).toBe(2)
    })
    it(`receives the data as input`, () => {
      const builder = Alge.match(tagB).A(() => 1)
      expect(
        builder.else((data) => {
          expectType<Tag>(data)
          return data
        })
      ).toEqual(tagB)
    })
  })
})

describe(`.done`, () => {
  it(`not available if no matchers have been defined`, () => {
    const builder = Alge.match(tagA)
    // @ts-expect-error Not available yet.
    builder.done
    // @ts-expect-error ^^^
    expect(builder.done).toBeUndefined()
  })
  it(`not available if some tag matchers have not been defined`, () => {
    const builder = Alge.match(tagA).A(() => 1 as const)
    // @ts-expect-error Not available yet.
    builder.done
    // @ts-expect-error ...
    // But we cannot enforce this at runtime since runtime does not
    // know the number of union members in the static type.
    expect(builder.done).toBeDefined()
  })
  it(`available if all tag matchers have been defined`, () => {
    const builder = Alge.match(tagA)
      .A(() => 1 as const)
      .B(() => 2 as const)
    expectType<() => 1 | 2>(builder.done)
    expect(typeof builder.done).toBe(`function`)
  })
  it(`executes the matcher and returns the result`, () => {
    const resultA = Alge.match(tagA)
      .A(() => 1 as const)
      .B(() => 2 as const)
      .done()
    expectType<1 | 2>(resultA)
    expect(resultA).toEqual(1)
    const resultB = Alge.match(tagB)
      .A(() => 1 as const)
      .B(() => 2 as const)
      .done()
    expectType<1 | 2>(resultB)
    expect(resultB).toEqual(2)
  })
  it(`throws an error if matchers somehow do not match`, () => {
    expect(() =>
      Alge.match('bad' as Tag)
        .A(() => 1 as const)
        .B(() => 2 as const)
        .done()
    ).toThrowErrorMatchingInlineSnapshot(`
      "No matcher matched on the given data. This should be impossible. Are you sure the runtime is not different than the static types? Please report a bug at https://jasonkuhrt/alge. The given data was:
      \\"bad\\""
    `)
  })
})
