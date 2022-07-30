import { AB } from '../../__helpers__.js'

it(`Can be given a name which becomes a static namespace on the ADT`, () => {
  expect(AB.A).toBeDefined()
  expect(AB.B).toBeDefined()
})
