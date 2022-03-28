export type TagBase = string

export type TagProperty = `_tag`

/**
 * Get the data type without its tag property.
 */
export type OmitTag<T> = Omit<T, TagProperty>
