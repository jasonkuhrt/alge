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

This data modelling is flawed. There is out-of-band information about import data relationships. When `isExact` is `true` then `range` is undefined but other fields are guaranteed, well, except `release` and `build` which are always optional actually. In other words these configurations of the data are impossible:

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

Notice the `!`. Its us telling Type Script that `major` is definitely not undefined and so the type error can be ignored. In JS its even worse, as we wouldn't even be prompted to think about such cases, unless we remember to. Seems trivial in this case, but at scale day after day often with unfamiliar code a mistake will inevitably be made. Another approach could have been this:

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

When a developer deals with values of `Pin` type they will have an immediately much better understanding of the possible states.

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

At scale, having well modelled data can be a life saver. The up front verbosity pays dividends downstream for all the impossible branches removed from programs' possibility space. ADTs help you (or your consumers) focus on what _can actually happen_.

### Why Alge?

Now that we have some understanding about the _what_ and _why_ of ADTs let's look at their use in JavaScript/TypeScript and how Alge helps.

We start by defining the name of our ADT and its variants:

```ts
import { Alge } from 'alge'

const Moniker = Alge.data('Moniker').variant(`Scoped`).variant(`Global`).done()
```

This ADT isn't very useful yet because there are not any variant properties defined but already Alge gives us constructors to build our data types:

```ts
const scoped = Moniker.Scoped.create() // { _tag: 'Scoped' }
const global = Moniker.Global.create() // { _tag: 'Global' }
```

Let's define some properties. To do so we'll use `zod` which is a powerful library for creating schemas. Alge only accepts zod schemas.

```ts
const Moniker = Alge.data('Moniker')
  .variant(`Scoped`)
  .schema({
    scope: z.string(),
    name: z.string(),
  })
  .variant(`Global`)
  .schema({
    name: z.string(),
  })
  .done()
```

#### Constructors

With these schema definitions the type safe constructors now require corresponding input:

```ts
const scoped = Moniker.Scoped.create({
  name: 'foo',
}) // { _tag: 'Scoped', name: 'foo' }

const global = Moniker.Global.create({
  scope: 'foo',
  name: 'bar',
}) // { _tag: 'Global', scope: 'foo', name: 'bar' }
```

You can specify defaults for parts of your schema. Imagine we were making a URL ADT and expected most users to be using HTTPS. Then we could return that in our defaults and Alge will infer our types correctly for us automatically. Example:

```ts
const Url = Alge.data('Url')
.variant('Private')
.schema({
  protocol: z.enum([`https`, `http`]),
  host: z.string(),
  username: z.string(),
  password: z.string(),
})
.defaults(input => {
  return {
    protocol: 'https',
    ...input,
  }
})
.done()

Url.Private.create({
  username: 'foo',
  password: 'bar',
  host: 'hello.io'
  // The default:
  // protocol: 'https',
})
```


#### Static Types

Constructors are convenient but there's a lot more to Alge. Often you will write your own functions that need to be typed with the ADT. With Alge this is easy using `Alge.Infer` which leverages TypeScript inference:

```ts
type Moniker = Alge.Infer<typeof Moniker>

const doSomething = (moniker: Moniker['*']): null | Moniker['Scoped'] => {
  // TODO
}
```

Alge inference returns an object with a property per variant of the ADT as well as a special property `*` which is a union of all variants.

If you prefer to work with namespaces rather than objects to reference types you can use the following approach. It trades internal verbosity for consumer ergonomics:

```ts
type MonikerInferred = Alge.Infer<typeof Moniker>

type Moniker = MonikerInferred['*']

namespace Moniker {
  export type Local = MonikerInferred['Scoped']
  export type Global = MonikerInferred['Global']
}

const doSomething = (moniker: Moniker): null | Moniker.Scoped => {
  // TODO
}
```

#### Identity

Alge gives you helper functions useful for daily work with ADTs. `.is` is a variant method that checks if the given ADT value is that variant or not:

```ts
const onlyScoped = (moniker: Moniker): null | Moniker.Scoped => {
  return Moniker.Scoped.is(moniker) ? moniker : null
}
```

When you're working with unknown values there is `.$is` which accepts anything (which makes it less type safe than `.is` so prefer `.is` when you can use it):

```ts
const onlyScoped = (whoKnows: unknown): null | Moniker.Scoped => {
  return Moniker.Scoped.$is(whoKnows) ? moniker : null
}
```

#### Codecs

Sometimes there are other representations you want for your data. JSON is a very common one for transferring data between processes, over the network, etc. You can define your own codecs with Alge but JSON comes built in:

```ts
const globalMonikerJson = Moniker.Global.to.json(global) // '{"_tag": "Global", "name": "foo" }'
const globalMoniker = Moniker.Global.From.json(globalMonikerJson)
```

Imagine you want a way to transform your Moniker between this string representation:

```
ADT Variant               String Representation          
-----------               ---------------------          

Moniker Global            foo                             
Moniker Scoped            @foo/bar                       
```

Let's define a string codec to achieve just this.

```ts
const globalPackagePattern = /^([a-z0-9-~][a-z0-9-._~]*)$/

const scopedPackagePattern = /^(?:@([a-z0-9-~][a-z0-9-._~]*)\/)([a-z0-9-~][a-z0-9-._~]*)$/

const Moniker = Alge.data('Moniker')
  .variant(`Scoped`)
  .schema({
    scope: z.string(),
    name: z.string(),
  })
  .codec('string', {
    to: (moniker) => `@${moniker.scope}/${moniker.name}`,
    from: (string) => {
      const match = scopedPackagePattern.exec(string)
      return match
        ? null
        : {
            scope: match[2]!,
            name: match[1]!,
          }
    },
  })
  .variant(`Global`)
  .schema({
    name: z.string(),
  })
  .codec('string', {
    to: (moniker) => moniker.name,
    from: (string) => {
      const match = globalPackagePattern.exec(string)
      return match === null ? null : { name: match[1]! }
    },
  })
  .done()
```

The `string` codec that we have defined can now be used by the ADT Variant API under the `to` and `from` namespaces respectively. Example:

```ts
const globalMonikerString = Moniker.Global.to.string(local) // 'foo'
const globalMoniker = Moniker.Global.From.string(globalMonikerString) // { '_tag': 'Global', name: 'foo' }
```

Decoding could fail of course since not all strings can be Monikers. When that happens `null` is returned.

```ts
const globalMoniker = Moniker.Global.From.string('!') // null
```

But sometimes `null` is not convenient, in which case you can use `*orThrow` method variations:

```ts
const globalMoniker = Moniker.Global.From.stringOrThrow('!') // throws
```

When all variants share a codec definition (e.g. `string` in this case) then a generalized ADT level codec is automatically made available as well. Decoders return a union of the variants while encoders always return a string. Each variant decoder is run until one matches or none do. The decoder run order respects the order in which you defined your variants.

Example:

```ts
Moniker.from.string('foo') // { _tag: 'Global', name: 'foo' }
Moniker.from.string('@foo/bar') // { _tag: 'Scoped', scope: 'foo', name: 'bar' }
Moniker.from.string('!') // null
```

As with the ADT Variant API there are `*orThrow` method variations. Example:

```ts
Moniker.from.stringOrThrow('!') // throws
```

#### Lone Variant

It is possible to define a lone variant instead of a whole ADT:

```ts
const Foo = Alge.datum('Foo').schema({
  a: z.number(),
  b: z.string(),
})
```

</br>
</br>
</br>
</br>
</br>

![Alt](https://repobeats.axiom.co/api/embed/3c932f1cb76da4ad21328bfdd0ad1c6fbbe76a0b.svg 'Repobeats analytics image')
