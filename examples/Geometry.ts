import { Alge } from '../src/index.js'
import { z } from 'zod'

const Length = z.number().positive()

export const Shape = Alge.data(`Shape`)
  .variant(`Rectangle`)
  .schema({
    width: Length,
    height: Length,
  })
  .variant(`circle`)
  .schema({
    radius: Length,
  })
  .variant(`Square`)
  .schema({
    size: Length,
  })
  .done()
