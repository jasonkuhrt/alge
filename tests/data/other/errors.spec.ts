import { data } from '../../../src/index_.js'
import { $A } from '../__helpers__.js'

describe(`errors`, () => {
  it(`call .done() without any variants`, () => {
    const a = data($A)
    // @ts-expect-error .done is not statically available.
    // eslint-disable-next-line
    const done = a.done
    // eslint-disable-next-line
    expect(done).toThrowErrorMatchingInlineSnapshot(
      `"Alge User Mistake: No variants defined for ADT \`A\` but \`.done()\` was called. You can only call \`.done()\` after your ADT has at least one variant defined (via \`.variant()\`)."`
    )
  })
})
