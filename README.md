# alge 🌱

[![trunk](https://github.com/jasonkuhrt/alge/actions/workflows/trunk.yml/badge.svg)](https://github.com/jasonkuhrt/alge/actions/workflows/trunk.yml)

Type safe fluent API for creating [Algebraic Data Types](https://en.wikipedia.org/wiki/Algebraic_data_type) (ADTs) in TypeScript.

Pronounced "AL GEE" like [the plant](https://en.wikipedia.org/wiki/Algae).

## Installation

```
npm add alge
```

## Guide

Alge is a Type Script library for creating [Algebraic Data Types](https://en.wikipedia.org/wiki/Algebraic_data_type) (ADTs). This guide will take you from not knowing what ADTs are to why you might want to use Alge for them in your code.

### What are Algebraic Data Types?

Algebraic Data Types (ADTs for short) are a methodology of modelling data. They could appear in any context that is about defining and/or navigating the shape of data. One of their fundamental benefits is that they can express different states/invariants/facts about/of data. They are the combination of two other concepts, _product types_ and _union types_.

A product type is like:

```ts
interface Foo {
  bar: string
  qux: number
}
```

A union type is like:

```ts
type Foo = 1 | 2 | 3
```

Basically, when the power of these two data modelling techniques are combined, we get something far greater than the sum of its parts: ADTs.

ADTs can particularly shine at build time. While dynamically typed programing languages ("scripting language", e.g. Ruby, JavaScript, Python, ...) can support ADTs at runtime, adding static type support into the mix increases the ADT value proposition. Then there are yet other more minor programing language features like pattern matching that if supporting ADTs make them feel that much more beneficial too.

References:

- [Wikipedia entry on ADTs](https://en.wikipedia.org/wiki/Algebraic_data_type)
- [Type Script documentation on discriminated unions](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)

### Why Algebraic Data Types?

Now that we have some understanding of _what_ ADTs are let's build some understanding about _why_ we might want to use them. To do this we'll work with an example.

Let's say we want to accept some user input about an npm package dependency version pin. It might come in the form of an exact version or a range of acceptable versions. How would we model this? Let's start without ADTs and then refactor with them to appreciate the difference. Let's assume that input parsing has been taken care of and so here we're only concerned with structured data modelling.

```ts
interface Pin {
  isExact: boolean
  patch?: number
  minor?: number
  major?: number
  release?: string
  build?: string
  range?: Array<{
    operator: `~` | `>=` | `...` // etc.
    isExact: boolean
    patch: number
    minor: number
    major: number
    release?: string
    build?: string
  }>
}
```

This data modelling is flawed. There is out-of-band information about import data relationships. When `isExact` is `true` then `range` is undefined but other fields are guarnateed, well, except `release` and `build` which are always optional actually. In other words these configurations of the data are impossible:

```ts
const pin = {
  isExact: true,
  patch: 1,
  minor: 2,
  major: 3,
  range: [
    {
      operator: `~`,
      patch: 1,
      minor: 0,
      major: 0,
    },
  ],
}
```

```ts
const pin = {
  isExact: false,
  patch: 1,
  minor: 2,
  major: 3,
}
```

While these are possible:

```ts
const pin = {
  isExact: true,
  patch: 1,
  minor: 2,
  major: 3,
}
```

```ts
const pin = {
  isExact: true,
  patch: 1,
  minor: 2,
  major: 3,
  release: `beta`,
}
```

```ts
const pin = {
  isExact: false,
  range: [
    {
      operator: `~`,
      patch: 1,
      minor: 0,
      major: 0,
    },
  ],
}
```

But since our data modelling doesn't encode these _facts_ our code suffers. For example:

```ts
if (pin.isExact) {
  doSomething(pin.major!)
  //                       ^
}
```

Notice the `!`. Its us telling Type Script that `major` is definitely not undefined and so the type error can be ignored. In JS its even worse, as we wouldn't even be prompted to think about such cases, unless we remember to. Seems trivial in this case, but at scale day after day often with unfamilar code a mistake will inevitably be made. Another approach could have been this:

```ts
if (pin.isExact) {
  if (!pin.major) throw new Error(`Bad pin data!`)
  doSomething(pin.major)
}
```

So, poor data modelling affects the quality of our code by our code either needing to deal with apparently possible states that are actually impossible OR by our code carefully ignoring those impossible states. Both solutions are terrible because they make code harder to read. There is more code, and the chance that wires about impossible and possible states will cross becomes a real possibility leading to potential runtime errors.

ADTs solve this. Let's refactor our Pin type into an ADT to see how!

```ts
type Pin = ExactPin | RangePin

interface ExactPin {
  tag: `ExactPin`
  patch: number
  minor: number
  major: number
  release?: string
  build?: string
}

interface RangePin {
  tag: `RangePin`
  values: Array<{
    operator: `~` | `>=` | `...` // etc.
    isExact: boolean
    patch: number
    minor: number
    major: number
    release?: string
    build?: string
  }>
}
```

Now we've encoded the possible states we cared about. Our code quality increases:

```ts
if (pin.tag === 'ExactPin') {
  doSomething(pin.major) // No problem, `pin` has been narrowed from `Pin` to `ExactPin`!
}
```

When a developer deals with values of `Pin` type they will have an immedaitely much better understanding of the possible states.

In fact every optional property in some data represents possibly different state representations and thus potentially a use case for an ADT. So for example we could go further with our above data modelling and define things like `ExactPreReleasePin` and `ExactPreReleaseBuildPin`:

```ts
interface ExactPreReleasePin {
  tag: `ExactPreReleasePin`
  patch: number
  minor: number
  major: number
  release: string
}
```

```ts
interface ExactPreReleaseBuildPin {
  tag: `ExactPreReleasePin`
  patch: number
  minor: number
  major: number
  release: string
  build: string
}
```

Of course like any technique there is a point where ADT modelling is probably overkill for your use-case. That said, that line might be further out than you think. For example while the above might seem excessive, it actually answers a question the previous data modelling left ambiguous which is the question of, is the following state possible?

```ts
const pin = {
  isExact: true,
  patch: 1,
  minor: 2,
  major: 3,
  build: `5`,
}
```

The answer is no! But without the ADT that _fact_ would have to managed by humans, rather than the machine.

At scale, having well modelled data can be a life saver. The up front verbosity pays dividens downstream for all the impossible branches removed from programs' possibility space. ADTs help you (or your consumers) focus on what _can actually happen_.

### Why Alge?

Now that we have some understanding about the _what_ and _why_ of ADTs let's look at their use in JavaScript/TypeScript and how Alge helps. We will continue with our Semver data type example. First we will achieve the exact API we want without `Alge`, then we will _refactor_ it to use `Alge`, and in showing this before/after hopefully make the value proposition crystal clear!

#### The Semver ADT Without Alge

TODO

#### The Semver ADT With Alge

TODO

## Reference

TODO

</br>
</br>
</br>
</br>
</br>

![Alt](https://repobeats.axiom.co/api/embed/3c932f1cb76da4ad21328bfdd0ad1c6fbbe76a0b.svg 'Repobeats analytics image')
