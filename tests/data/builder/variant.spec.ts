import { A } from '../__helpers__.js'

it(`Can be given a name which becomes a static namespace on the ADT`, () => {
  expect(A.M).toBeDefined()
  expect(A.N).toBeDefined()
})
