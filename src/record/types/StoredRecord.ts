// prettier-ignore

import { SomeSchemaDef } from '../../core/internal.js'
import { ExtensionsBase, SomeName } from '../../core/types.js'
import { SomeDefaults } from './builder.js'
import { z } from 'zod'

export type StoredRecord = {
  name: string
  schema: z.ZodRawShape
  codec: [...string[]]
  extensions: ExtensionsBase
  defaults: null | SomeDefaults
}

// eslint-disable-next-line
export namespace StoredRecord {
  export type Create<Name extends SomeName> = {
    name: Name
    schema: { _tag: z.ZodLiteral<Name> }
    codec: []
    // TODO
    // eslint-disable-next-line
    extensions: {}
    defaults: null
  }

  export type AddSchemaDefinition<Schema extends SomeSchemaDef, V extends StoredRecord> = Omit<
    V,
    `schema`
  > & { schema: Schema & { _tag: z.ZodLiteral<V['name']> } }

  export type AddCodec<Name extends string, V extends StoredRecord> = Omit<V, `codec`> & {
    codec: [Name, ...V['codec']]
  }

  export type AddDefaults<V extends StoredRecord, Defaults> = Omit<V, `defaults`> & { defaults: Defaults }

  export type AddExtensions<Extensions extends ExtensionsBase, V extends StoredRecord> = V & {
    extensions: Extensions
  }

  export type GetType<R extends StoredRecord> = z.TypeOf<z.ZodObject<R[`schema`]>>

  export type GetZodSchema<V extends StoredRecord> = z.ZodObject<V[`schema`]>
}
