import { Alge } from '../../../src/index.js'
import { $AB } from '../../__helpers__.js'

describe(`errors`, () => {
  it(`call .done() without any records`, () => {
    const a = Alge.data($AB)
    // @ts-expect-error .done is not statically available.
    // eslint-disable-next-line
    const done = a.done
    // eslint-disable-next-line
    expect(done).toThrowErrorMatchingInlineSnapshot(
      `"Alge User Mistake: No records defined for ADT \`AB\` but \`.done()\` was called. You can only call \`.done()\` after your ADT has at least one record defined (via \`.record()\`)."`
    )
  })
})
