/*

Terminology:

- Match Builder
- Matcher
  - Tag Matcher
  - Data Matcher
- Pattern
  - Tag
  - Data
- Handler
 */

import { OmitTag } from './core/types.js'
import { inspect } from './lib/utils.js'
import { SomeRecord } from './record/types/controller.js'
import isMatch from 'lodash.ismatch'

export type SomeMatchHandler = (data: object) => unknown
export type TagMatcherDefinition = {
  _tag: 'TagMatcherDefinition'
  tag: string
  handler: SomeMatchHandler
}
export type DataMatcherDefinition = {
  _tag: 'DataMatcherDefinition'
  tag: string
  dataPattern: object
  handler: SomeMatchHandler
}

export const match = <AlgebraicDataType extends SomeRecord>(
  algebraicDataType: AlgebraicDataType
): PreMatcher<AlgebraicDataType, never> => {
  const elseBranch: { defined: boolean; value: unknown | ((data: object) => unknown) } = {
    defined: false,
    value: undefined,
  }
  const matcherStack: (DataMatcherDefinition | TagMatcherDefinition)[] = []
  const tagMatchers: Record<string, TagMatcherDefinition> = {}

  const execute = () => {
    for (const matcher of matcherStack) {
      if (matcher.tag === algebraicDataType._tag) {
        if (matcher._tag === `DataMatcherDefinition`) {
          if (isMatch(algebraicDataType, matcher.dataPattern)) {
            return matcher.handler(algebraicDataType)
          }
        } else {
          return matcher.handler(algebraicDataType)
        }
      }
    }
    if (elseBranch.defined) {
      return typeof elseBranch.value === `function`
        ? (elseBranch.value(algebraicDataType) as unknown)
        : elseBranch.value
    }
    throw new Error(
      `No matcher matched on the given data. This should be impossible. Are you sure the runtime is not different than the static types? Please report a bug at https://jasonkuhrt/alge. The given data was:\n${inspect(
        algebraicDataType
      )}`
    )
  }

  const proxy = new Proxy(
    {},
    {
      get: (_target, property: string, _receiver) => {
        if (property === `else`) {
          if (matcherStack.length === 0) return undefined

          elseBranch.defined = true
          return (value: unknown) => {
            elseBranch.value = value
            return execute()
          }
        }
        if (property === `done`) {
          // done only when exhaustive, only exhaustive when every tag generally matched
          if (Object.keys(tagMatchers).length === 0) return undefined

          return execute
        }

        return (...args: [handler: SomeMatchHandler] | [dataPattern: object, handler: SomeMatchHandler]) => {
          const matcher =
            args.length === 1
              ? { _tag: `TagMatcherDefinition` as const, tag: property, handler: args[0] }
              : {
                  _tag: `DataMatcherDefinition` as const,
                  tag: property,
                  dataPattern: args[0],
                  handler: args[1],
                }

          if (tagMatchers[property]) {
            if (matcher._tag === `TagMatcherDefinition`) {
              throw new Error(`${property} has already been matched on.`)
            }
            throw new Error(
              `Cannot define this data matcher:\n${inspect(
                args[0]
              )}\nfor ${property} because it will never match because it comes after matching on ${property} generally.`
            )
          }

          matcherStack.push(matcher)

          if (matcher._tag === `TagMatcherDefinition`) {
            tagMatchers[property] = matcher
          }
          return proxy
        }
      },
    }
  )

  // eslint-disable-next-line
  return proxy as any
}

type PickRecordHavingTag<Tag extends string, ADT extends SomeRecord> = ADT extends { _tag: Tag } ? ADT : never

//prettier-ignore
type PreMatcher<ADT extends SomeRecord, Result> = {
  [Tag in ADT['_tag']]:
     (<ThisResult extends unknown, Pattern extends Partial<OmitTag<PickRecordHavingTag<Tag, ADT>>>>(dataPattern: Pattern, handler: (data: Pattern & PickRecordHavingTag<Tag, ADT>, test:Pattern) => ThisResult) => PostMatcher<ADT, never, ThisResult | Result>) &
     (<ThisResult extends unknown>(handler: (data: PickRecordHavingTag<Tag, ADT>) => ThisResult) => PostMatcher<ADT, Tag, ThisResult | Result>)
}

/**
 * 1. When an unqualified variant matcher has been defined then
 *    it should be be definable again in the chain since it would
 *    never be called at runtime
 */
//prettier-ignore
type PostMatcher<ADT extends SomeRecord, PreviousTagsMatched extends string, Result> = {
  [Tag in Exclude<ADT['_tag'], PreviousTagsMatched>]:
  (
    (<ThisResult extends unknown, Pattern extends Partial<OmitTag<PickRecordHavingTag<Tag, ADT>>>>(dataPattern: Pattern, handler: (data: Pattern & PickRecordHavingTag<Tag, ADT>) => ThisResult) => PostMatcher<ADT, PreviousTagsMatched, '__init__' extends Result ? ThisResult : ThisResult | Result>) &
    (<ThisResult extends unknown>(handler: (data: PickRecordHavingTag<Tag, ADT>) => ThisResult) => PostMatcher<ADT, Tag|PreviousTagsMatched, ThisResult | Result>)
  )
  //      ^[1]                 ^[1]
} & (
  ADT['_tag'] extends PreviousTagsMatched ? {
    done: () => Result
  } : {
    else: <ThisResult extends unknown>(value: ThisResult | ((data: ExcludeByTag<ADT, PreviousTagsMatched>) => ThisResult)) => Result | ThisResult
  }
)

type ExcludeByTag<Record extends SomeRecord, Tag extends string> = Record extends { _tag: Tag }
  ? never
  : Record
