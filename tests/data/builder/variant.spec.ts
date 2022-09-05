import { AB } from '../../__helpers__.js'
import { expect, it } from 'vitest'

it(`Can be given a name which becomes a static namespace on the ADT`, () => {
  expect(AB.A).toBeDefined()
  expect(AB.B).toBeDefined()
})
