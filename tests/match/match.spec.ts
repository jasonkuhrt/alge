/* eslint-disable */

import { Alge } from '../../src/index.js'
import { SomeRecord } from '../../src/record/types/controller.js'
import { $A, $AB, $B, A, a, ab, B, b } from '../__helpers__.js'
import { expectType } from 'tsd'
import { z } from 'zod'

it(`is a function`, () => {
  expect(typeof Alge.match).toEqual(`function`)
  expectType<(adt: SomeRecord) => any>(Alge.match)
})

it(`returns a Match Builder, an object with methods named according to the possible records in the value`, () => {
  const builder = Alge.match(ab)
  expect(typeof builder.A).toBe(`function`)
  expect(typeof builder.B).toBe(`function`)
  expectType<(handler: (data: A) => unknown) => any>(builder.A)
  expectType<(handler: (data: B) => unknown) => any>(builder.B)
})

describe(`.<tag> (Tag Matcher)`, () => {
  describe(`after a tag matcher`, () => {
    it(`cannot match the same tag again`, () => {
      const builder = Alge.match(ab).A((a) => 1)

      // @ts-expect-error Already defined
      expect(() => builder.A((a) => 1)).toThrowErrorMatchingInlineSnapshot(`"A has already been matched on."`)
    })
    it(`can match another tag`, () => {
      const builder = Alge.match(ab).A((a) => 1 as const)
      expectType<(handler: (data: B) => unknown) => any>(builder.B)
      expect(typeof builder.B).toBe(`function`)
    })
  })
})

describe(`.<tag> (Data Matcher)`, () => {
  it(`Accepts a data pattern followed by the handler`, () => {
    const builder = Alge.match(a as ab)
    expectType<(dataPattern: a, handler: (data: a) => unknown) => any>(builder.A)
    expect(builder.A({ m: `m` }, () => 1).else(null)).toBe(1)
  })

  describe(`after a tag matcher`, () => {
    it(`cannot define a Data matcher for the same tag because the tag matcher is more general`, () => {
      const builder = Alge.match(a as ab).A(() => 1)
      // @ts-expect-error Not available
      builder.A
      // @ts-expect-error ^^^
      expect(() => builder.A({ m: `` }, () => 1)).toThrowErrorMatchingInlineSnapshot(`
        "Cannot define this data matcher:
        {"m":""}
        for A because it will never match because it comes after matching on A generally."
      `)
    })
  })
  describe(`after a data matcher`, () => {
    it(`can define a tag matcher for the same tag`, () => {
      const builder = Alge.match(ab).A({ m: `` }, () => 1)
      expectType<(handler: (data: A) => unknown) => any>(builder.A)
      expect(typeof builder.A).toBe(`function`)
    })

    it(`can define a tag matcher for another tag`, () => {
      const builder = Alge.match(ab).A({ m: `` }, () => 1)
      expectType<(handler: (data: B) => unknown) => any>(builder.B)
      expect(typeof builder.B).toBe(`function`)
    })

    it(`can define another data matcher for same tag`, () => {
      const builder = Alge.match(a as ab).A({ m: `foo` }, () => 1)
      expectType<(dataPattern: a, handler: (data: a) => unknown) => any>(builder.A)
      expect(builder.A({ m: `m` }, () => 2).else(null)).toBe(2)
    })
  })
  it('_tag is omitted from the data that can be matched on', () => {
    // TODO We can manually test that _tag is not expected below but how do we create an automated test?
    // We cannot get the parameters it seems because the function is overloaded
    Alge.match(ab).A({ m: '' /* , _tag: 'A'  <-- not accepted but ignored */ }, () => 1)
  })
  it('narrows the data based on the match', () => {
    const AB = Alge.data($AB)
      .record($A)
      .schema({ a: z.enum(['a', 'b', 'c']) })
      .record($B)
      .schema({ b: z.enum(['a', 'b', 'c']) })
      .done()
    const ab = Math.random() > 0.5 ? AB.A.create({ a: 'a' }) : AB.B.create({ b: 'b' })
    const result = Alge.match(ab)
      .A({ a: 'c' }, (a) => {
        expectType<{ _tag: 'A'; a: 'c' }>(a)
        return a
      })
      .B({ b: 'a' }, (a) => {
        expectType<{ _tag: 'B'; b: 'a' }>(a)
        return a
      })
      .else(null)
    expectType<null | { _tag: 'B'; b: 'a' } | { _tag: 'A'; a: 'c' }>(result)
  })
})

describe(`.else`, () => {
  it(`not available if no matchers have been defined`, () => {
    const builder = Alge.match(ab)
    // @ts-expect-error Not available yet.
    builder.else
    // @ts-expect-error ^^^
    expect(builder.else).toBeUndefined()
  })
  it(`not available if all tag matchers have been defined`, () => {
    const builder = Alge.match(ab)
    // @ts-expect-error Not available yet.
    builder.else
    // @ts-expect-error ^^^
    expect(builder.else).toBeUndefined()
  })
  it(`is available if some but not all tag matchers have been defined`, () => {
    const builder = Alge.match(ab).A(() => 1 as const)
    expectType<typeof builder.else>(
      0 as any as <ThisResult>(value: ThisResult | ((data: ab) => ThisResult)) => 1 | ThisResult
    )
    expect(builder.else).toBeDefined()
  })
  it(`is available if some data matchers have been defined`, () => {
    const builder = Alge.match(ab).A({ m: `` }, () => 1)
    expectType<typeof builder.else>(
      0 as any as <ThisResult>(value: ThisResult | ((data: ab) => ThisResult)) => 1 | ThisResult
    )
    expect(builder.else).toBeDefined()
  })
  it(`executes the matcher and returns else value if no matcher matched`, () => {
    const builderA = Alge.match(a as ab).A(() => 1 as const)
    expect(builderA.else(null)).toBe(1)
    const builderB = Alge.match(b as ab).A(() => 2 as const)
    expect(builderB.else(null)).toBeNull()
  })
  describe(`lazy value`, () => {
    it(`if else value is a function then it is considered a lazy value`, () => {
      const builder = Alge.match(b as ab).A(() => 1)
      expect(builder.else(() => 2)).toBe(2)
    })
    it(`receives the data as input`, () => {
      const builder = Alge.match(b as ab).A(() => 1)
      expect(
        builder.else((data) => {
          expectType<ab>(data)
          return data
        })
      ).toEqual(b)
    })
  })
})

describe(`.done`, () => {
  it(`not available if no matchers have been defined`, () => {
    const builder = Alge.match(ab)
    // @ts-expect-error Not available yet.
    builder.done
    // @ts-expect-error ^^^
    expect(builder.done).toBeUndefined()
  })
  it(`not available if no tag matchers have been defined`, () => {
    const builder = Alge.match(ab).A({ m: `` }, () => 1)
    // @ts-expect-error Not available yet.
    builder.done
    // @ts-expect-error ^^^
    expect(builder.done).toBeUndefined()
  })
  it(`not available if some tag matchers have not been defined`, () => {
    const builder = Alge.match(ab)
      .A(() => 1 as const)
      .B(() => 2 as const)
    // @ts-expect-error Not available yet.
    builder.else
    // @ts-expect-error ...
    // But we cannot enforce this at runtime since runtime does not
    // know the number of union members in the static type.
    expect(builder.else).toBeDefined()
  })
  it(`available if all tag matchers have been defined`, () => {
    const builder = Alge.match(ab)
      .A(() => 1 as const)
      .B(() => 2 as const)
    expectType<() => 1 | 2>(builder.done)
    expect(typeof builder.done).toBe(`function`)
  })
  it(`executes the matcher and returns the result`, () => {
    const resultA = Alge.match(a as ab)
      .A(() => 1 as const)
      .B(() => 2 as const)
      .done()
    expectType<1 | 2>(resultA)
    expect(resultA).toEqual(1)
    const resultB = Alge.match(b as ab)
      .A(() => 1 as const)
      .B(() => 2 as const)
      .done()
    expectType<1 | 2>(resultB)
    expect(resultB).toEqual(2)
  })
  it(`throws an error if matchers somehow do not match`, () => {
    expect(() =>
      Alge.match({ bad: true } as any as ab)
        .A(() => 1 as const)
        .B(() => 2 as const)
        .done()
    ).toThrowErrorMatchingInlineSnapshot(`
      "No matcher matched on the given data. This should be impossible. Are you sure the runtime is not different than the static types? Please report a bug at https://todo. The given data was:
      {"bad":true}"
    `)
  })
})
