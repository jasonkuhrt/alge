import { DefaultsBase } from '~/datum/types/builder'
import { GetConstructorInput, SomeDatumController } from '~/datum/types/controller'
import { z } from 'zod'

export type SchemaBase = Record<string, z.ZodType<unknown>>

export type ExtensionsBase = Record<string, unknown>

export type NameBase = string

export interface CodecDefiniton<V extends StoredVariant = StoredVariant> {
  encode: EncoderDefinition<V>
  decode: DecoderDefinition<V>
}

export type EncoderDefinition<V extends StoredVariant> = (variant: StoredVariant.GetType<V>) => string

export type Encoder<V extends StoredVariant> = EncoderDefinition<V>

export type ADTEncoder<Vs extends StoredVariants> = (adt: StoredVariants.Union<Vs>) => string

export type DecoderDefinition<V extends StoredVariant> = (
  encodedData: string,
  extensions: V[`extensions`] & { schema: StoredVariant.GetZodSchema<V>; name: V[`name`] }
) => null | GetConstructorInput<V>

export type Decoder<V extends StoredVariant> = (value: string) => null | StoredVariant.GetType<V>

export type DecoderThatThrows<V extends StoredVariant> = (value: string) => StoredVariant.GetType<V>

export type ADTDecoder<Vs extends StoredVariants> = (value: string) => null | StoredVariants.Union<Vs>

export type ADTDecoderThatThrows<Vs extends StoredVariants> = (value: string) => StoredVariants.Union<Vs>

export type InputBase = object

export type StoredVariant = {
  name: string
  schema: z.ZodRawShape
  codec: boolean
  extensions: ExtensionsBase
  defaults: null | DefaultsBase
}

// prettier-ignore
// eslint-disable-next-line
export namespace StoredVariant {
  export type Create<Name extends NameBase> = {
    name: Name
    schema: { _tag: z.ZodLiteral<Name> }
    codec: false
    // TODO
    // eslint-disable-next-line
    extensions: {}
    defaults: null
  }
  export type AddSchema<Schema extends SchemaBase, V extends StoredVariant> =
    Omit<V, `schema`> & { schema: Schema & { _tag: z.ZodLiteral<V['name']> } }
    
  export type AddCodec<V extends StoredVariant> =
    Omit<V, `codec`> & { codec: true }

  export type AddDefaults<V extends StoredVariant, Defaults> = 
    Omit<V, `defaults`> & { defaults: Defaults }

  export type AddExtensions<Extensions extends ExtensionsBase, V extends StoredVariant> =
    V & { extensions: Extensions }

  export type GetType<V extends StoredVariant> =
    z.TypeOf<z.ZodObject<V[`schema`]>>
  
  export type GetZodSchema<V extends StoredVariant> =
    z.ZodObject<V[`schema`]>
}

export type StoredVariants = [StoredVariant, ...StoredVariant[]]

export type SomeDatumInternals = {
  _: {
    tag: string
  }
}

export type WithSomeDatumInternals<T> = T & SomeDatumInternals

// eslint-disable-next-line
export namespace StoredVariants {
  export type ZodUnion<Vs extends StoredVariants> = z.ZodUnion<ToZodObjects<Vs>>

  export type Union<Vs extends StoredVariants> = z.TypeOf<ZodUnion<Vs>>

  export type IsAllHaveCodec<Vs extends StoredVariants> = {
    [I in keyof Vs]: Vs[I][`codec`] extends true ? true : false
  } extends [true, ...true[]]
    ? true
    : false

  export type IsAllHaveParse<Vs extends StoredVariants> = {
    // @ts-expect-error adf
    [K in keyof Vs]: unknown extends Vs[K][1][`parse`] ? `missing` : never
  } extends [never, ...never[]]
    ? true
    : false

  type ToZodObjects<Vs extends StoredVariants> = {
    [Index in keyof Vs]: z.ZodObject<Vs[Index][`schema`]>
  }
}

export type CreateStoredDatum<Name extends NameBase> = {
  name: Name
  schema: { _tag: z.ZodLiteral<Name> }
  codec: false
  // TODO
  // eslint-disable-next-line
  extensions: {}
  defaults: null
}

export type CreateStoredDatumFromDatum<Datum extends SomeDatumController> = {
  name: Datum['name']
  schema: Datum['schema']['shape']
  codec: Datum['encode'] extends never ? false : true
  extensions: Omit<Datum, 'symbol' | 'create' | 'name' | 'schema' | 'encode' | 'decode' | 'is' | '$is'>
  defaults: null extends Datum['_']['defaultsProvider']
    ? null
    : ReturnType<Exclude<Datum['_']['defaultsProvider'], null>>
}
