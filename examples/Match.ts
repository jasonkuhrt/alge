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

type Shape = { type: `circle`; radius: number } | { type: `square`; size: number }

const shapes = [
  { type: `circle`, radius: 10 },
  { type: `square`, size: 20 },
] satisfies [Shape, ...Shape[]]

const shape = Math.random() > 0.5 ? shapes[0] : shapes[1]

const _shapeMatchResult = Alge.match(shape)
  .circle(() => `Do something with circle` as const)
  .square(() => `Do something with square` as const)
  .done()
