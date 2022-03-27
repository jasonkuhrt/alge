/**
 * Does the todo thing.
 *
 * @example
 *
 * ```ts
 *   const a = todo({
 *     a: 1,
 *     b: 2,
 *   })
 * ```
 *
 */
export const todo = (task?: string): string => {
  return task ?? `nothing`
}
