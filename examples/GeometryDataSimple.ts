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

const circle = Shape.Circle.create({ radius: 11 })
console.log(circle)
// { _tag: 'Circle', radius: 10 }

const square = Shape.Square.create({ size: 13 })
console.log(square)
// { _tag: 'Circle', radius: 10 }

const shape = Math.random() > 0.5 ? circle : square

const tenOrNil = Alge.match(shape)
  .Circle({ radius: 10 }, () => true)
  .else(null)

console.log(tenOrNil)
// null

const result = Alge.match(shape)
  .Circle({ radius: 11 }, () => `big circle`)
  .Circle({ radius: 1 }, () => `little circle`)
  .Circle(() => `other circle`)
  .Square({ size: 13 }, () => `unlucky square`)
  .Square(() => `a good square`)
  .done()

console.log(result)
// Random:
// 'big circle'
// 'unlucky square'
