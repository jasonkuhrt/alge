import { Alge } from '../src/index.js'
import { z } from 'zod'

/**
 * Builder
 */

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

/**
 * Controller
 */

const circle = Shape.Circle.create({ radius: 11 })
const square = Shape.Square.create({ size: 13 })
const shape = Math.random() > 0.5 ? circle : square
Shape.Square.is(circle)
Shape.Circle.is(circle)
Shape.Circle.to.json(circle)
Shape.Circle.from.json(`{ "radius" 11, "_tag": "Circle" }`)
Shape.to.json(shape)
Shape.from.json(`{ "width" 17, "height": 22 "_tag": "Square" }`)

/**
 * Matcher
 */

Alge.match(shape)
  .Circle({ radius: 10 }, () => true)
  .else(null)

Alge.match(shape)
  .Circle({ radius: 11 }, () => `big circle`)
  .Circle({ radius: 1 }, () => `little circle`)
  .Circle(() => `other circle`)
  .Square({ size: 13 }, () => `unlucky square`)
  .Square(() => `a good square`)
  .done()
