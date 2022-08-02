import { Alge } from '../src/index.js'
import { z } from 'zod'

const Length = z.number().positive()

const Shape = Alge.data(`Shape`)
  .variant(`Rectangle`)
  .schema({
    width: Length,
    height: Length,
  })
  .codec(`graphic`, {
    to: (rectangle) => `${rectangle.width}x${rectangle.height}`,
    from: (graphic) => {
      const match = graphic.match(/(\d+)x(\d+)/)
      if (!match) return null
      const [_, width, height] = match
      return {
        width: Number(width),
        height: Number(height),
      }
    },
  })
  .variant(`Circle`)
  .schema({
    radius: Length,
  })
  .codec(`graphic`, {
    to: (circle) => `(---|${circle.radius})`,
    from: (graphic) => {
      const match = graphic.match(/\(---|(\d+)\)/)
      if (!match) return null
      const [_, radius] = match
      return {
        radius: Number(radius),
      }
    },
  })
  .variant(`Square`)
  .schema({
    size: Length,
  })
  .codec(`graphic`, {
    to: (square) => `[${square.size}]`,
    from: (graphic) => {
      const match = graphic.match(/[(\d+)]/)
      if (!match) return null
      const [_, size] = match
      return {
        size: Number(size),
      }
    },
  })
  .done()

const circle = Shape.Circle.create({ radius: 10 })

console.log({ circle })
// { _tag: 'Circle', radius: 10 }
