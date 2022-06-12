import { A } from '../__helpers__'

it(`Can be given a name which becomes a static namespace on the ADT`, () => {
  expect(A.M).toBeDefined()
  expect(A.N).toBeDefined()
})
