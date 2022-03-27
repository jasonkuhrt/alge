import * as Lib from '~/index'

test(`imports using paths config works relative`, () => {
  expect(Lib.todo()).toEqual(`nothing`)
})
