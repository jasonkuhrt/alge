import { Alge } from '../src/index.js'

/**
 * You can work with
 */

type Fruit = `apple` | `banana` | `orange`

const fruits = [`apple`, `banana`, `orange`] satisfies [Fruit, ...Fruit[]]

const fruit = fruits[Math.floor(Math.random() * fruits.length)]!

const _fruitMatchResult = Alge.match(fruit)
  .apple(() => `Do something with apple` as const)
  .banana(() => `Do something with banana` as const)
  .orange(() => `Do something with orange` as const)

/**
 * You can work with different names for the discriminant property. See docs for all options. Here are a few examples:
 */

/**
 * Example with `type`
 */

type Shape =
  | { type: `circle`; radius: number }
  | { type: `square`; size: number }
  | { type: `rectangle`; width: number; height: number }

const shapes = [
  { type: `circle`, radius: 10 },
  { type: `square`, size: 20 },
  { type: `rectangle`, width: 30, height: 40 },
] satisfies [Shape, ...Shape[]]

const shape = shapes[Math.floor(Math.random() * shapes.length)]!

const _shapeMatchResult = Alge.match(shape)
  .circle(() => `Do something with circle` as const)
  .square(() => `Do something with square` as const)
  .rectangle(() => `Do something with rectangle` as const)
  .done()

/**
 * Example with `kind`
 */

type Hero =
  | { kind: 'superman' }
  | { kind: 'batman' }
  | { kind: 'spiderman' }
  | { kind: 'wonderWoman' }
  | { kind: 'flash' }

const heroes = [
  { kind: `superman` },
  { kind: `batman` },
  { kind: `spiderman` },
  { kind: `wonderWoman` },
  { kind: `flash` },
] satisfies [Hero, ...Hero[]]

const hero = heroes[Math.floor(Math.random() * heroes.length)]!

const _heroMatchResult = Alge.match(hero)
  .batman(() => `Do something with batman` as const)
  .flash(() => `Do something with flash` as const)
  .spiderman(() => `Do something with spiderman` as const)
  .superman(() => `Do something with superman` as const)
  .wonderWoman(() => `Do something with wonderWoman` as const)
  .done()
