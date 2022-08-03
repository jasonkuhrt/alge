import { Alge } from '../src/index.js'
import { z } from 'zod'

const Length = z.number().positive()

export const Shape = Alge.data(`Shape`, {
  Rectangle: {
    width: Length,
    height: Length,
  },
  Circle: {
    radius: Length,
  },
  Square: {
    size: Length,
  },
})

const circle = Shape.Circle.create({ radius: 10 })

console.log({ circle })
// { _tag: 'Circle', radius: 10 }
