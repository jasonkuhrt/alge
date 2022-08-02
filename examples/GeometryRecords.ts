import { Alge } from '../src/index.js'
import { z } from 'zod'

const Length = z.number().positive()

export const Circle = Alge.record(`Circle`, {
  radius: Length,
})

export const Square = Alge.record(`Square`, {
  size: Length,
})

export const Rectangle = Alge.record(`Rectangle`, {
  width: Length,
  height: Length,
})

const circle = Circle.create({ radius: 10 })
console.log(circle)
// { _tag: 'Circle', radius: 10 }

const square = Square.create({ size: 10 })
console.log(square)
// { _tag: 'Square', size: 10 }

const rectangle = Rectangle.create({ width: 10, height: 20 })
console.log(rectangle)
// { _tag: 'Rectangle', width: 10, height: 20 }
