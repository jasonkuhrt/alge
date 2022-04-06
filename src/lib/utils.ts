export type IsUnknown<T> = IsEqual<T, unknown>

export type IsEqual<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TupleToObject<T extends [string, any]> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in T[0]]: Extract<T, [key, any]>[1]
}

export const isEmpty = (value: unknown[] | object) => {
  if (Array.isArray(value)) value.length === 0
  return Object.keys(value).length === 0
}

export const ensurePeriod = (s: string) => (s.length > 0 ? (s[s.length - 1] === `.` ? s : s + `.`) : s)

export const code = (s: string) => `\`${s}\``

/**
 * Cast the value to `any`
 */
// eslint-disable-next-line
export const asAny = (x: any): any => x
