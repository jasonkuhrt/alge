import { DecoderMethods, EncoderMethods } from '../data/types/Controller.js'
import { AssertString, ObjectValues, UnionToIntersection } from '../lib/utils.js'
import { DefaultsBase } from '../record/types/builder.js'
import { GetConstructorInput, SomeRecordController } from '../record/types/controller.js'
import { z } from 'zod'

export type SchemaBase = Record<string, z.ZodType<unknown>>

export type ExtensionsBase = Record<string, unknown>

export type NameBase = string

export interface CodecDefinition<V extends StoredRecord = StoredRecord> {
  encode: EncoderDefinition<V>
  decode: DecoderDefinition<V>
}

export interface CodecImplementation<V extends StoredRecord = StoredRecord> {
  to: EncoderDefinition<V>
  from: DecoderDefinition<V>
}

export type EncoderDefinition<V extends StoredRecord> = (record: StoredRecords.GetType<V>) => string

export type Encoder<V extends StoredRecord> = EncoderDefinition<V>

export type ADTEncoder<Vs extends StoredRecords> = (adt: StoredRecords.Union<Vs>) => string

export type DecoderDefinition<V extends StoredRecord> = (
  encodedData: string,
  extensions: V[`extensions`] & { schema: StoredRecords.GetZodSchema<V>; name: V[`name`] }
) => null | GetConstructorInput<V>

export type Decoder<V extends StoredRecord> = (value: string) => null | StoredRecords.GetType<V>

export type DecoderThatThrows<V extends StoredRecord> = (value: string) => StoredRecords.GetType<V>

export type ADTDecoder<Vs extends StoredRecords> = (value: string) => null | StoredRecords.Union<Vs>

export type ADTDecoderThatThrows<Vs extends StoredRecords> = (value: string) => StoredRecords.Union<Vs>

export type InputBase = object

export type StoredRecord = {
  name: string
  schema: z.ZodRawShape
  codec: [...string[]]
  extensions: ExtensionsBase
  defaults: null | DefaultsBase
}

// prettier-ignore
// eslint-disable-next-line
export namespace StoredRecords {
  export type Create<Name extends NameBase> = {
    name: Name
    schema: { _tag: z.ZodLiteral<Name> }
    codec: []
    // TODO
    // eslint-disable-next-line
    extensions: {}
    defaults: null
  }
  export type AddSchema<Schema extends SchemaBase, V extends StoredRecord> =
    Omit<V, `schema`> & { schema: Schema & { _tag: z.ZodLiteral<V['name']> } }
    
  export type AddCodec<Name extends string, V extends StoredRecord> =
    Omit<V, `codec`> & { codec: [Name, ...V['codec']] }

  export type AddDefaults<V extends StoredRecord, Defaults> = 
    Omit<V, `defaults`> & { defaults: Defaults }

  export type AddExtensions<Extensions extends ExtensionsBase, V extends StoredRecord> =
    V & { extensions: Extensions }

  export type GetType<V extends StoredRecord> =
    z.TypeOf<z.ZodObject<V[`schema`]>>
  
  export type GetZodSchema<V extends StoredRecord> =
    z.ZodObject<V[`schema`]>
}

export type StoredRecords = [StoredRecord, ...StoredRecord[]]

export type SomeRecordInternals = {
  _: {
    tag: string
  }
}

export type WithSomeRecordInternals<T> = T & SomeRecordInternals

// eslint-disable-next-line
export namespace StoredRecords {
  /**
   * Get the methods for decoders that are defined across all records.
   */
  export type GetAdtLevelDecoderMethods<Vs extends StoredRecords> = UnionToIntersection<
    ObjectValues<{
      [Codec in GetCommonCodecs<Vs>]: DecoderMethods<AssertString<Codec>, Vs>
    }>
  >

  type GetCommonCodecs<Vs extends StoredRecords> = ObjectValues<{
    [Codec in Vs[0]['codec'][number] as IsAllHaveCodec<Codec, Vs> extends true ? Codec : never]: Codec
  }>

  // type Vs = [
  //   StoredRecord.AddCodec<'foo2', StoredRecord.AddCodec<'foo1', CreateStoredRecord<'A'>>>,
  //   StoredRecord.AddCodec<'foo2', StoredRecord.AddCodec<'foo1', CreateStoredRecord<'B'>>>
  // ]
  // type a = GetCommonCodecs<Vs>
  // type b = GetAdtLevelDecoderMethods<Vs>

  /**
   * Get the methods for encoders that are defined across all records.
   */
  export type GetAdtLevelEncoderMethods<Vs extends StoredRecords> = UnionToIntersection<
    ObjectValues<{
      [Codec in GetCommonCodecs<Vs>]: EncoderMethods<AssertString<Codec>, Vs>
    }>
  >

  export type ZodUnion<Vs extends StoredRecords> = z.ZodUnion<ToZodObjects<Vs>>

  export type Union<Vs extends StoredRecords> = z.TypeOf<ZodUnion<Vs>>

  export type IsAllHaveCodec<Name extends string, Vs extends StoredRecords> = {
    [I in keyof Vs]: Name extends Vs[I][`codec`][number] ? true : false
  } extends [true, ...true[]]
    ? true
    : false

  export type IsAllHaveParse<Vs extends StoredRecords> = {
    // @ts-expect-error adf
    [K in keyof Vs]: unknown extends Vs[K][1][`parse`] ? `missing` : never
  } extends [never, ...never[]]
    ? true
    : false

  type ToZodObjects<Vs extends StoredRecords> = {
    [Index in keyof Vs]: z.ZodObject<Vs[Index][`schema`]>
  }
}

export type CreateStoredRecord<Name extends NameBase> = {
  name: Name
  schema: { _tag: z.ZodLiteral<Name> }
  codec: []
  // TODO
  // eslint-disable-next-line
  extensions: {}
  defaults: null
}

export type CreateStoredRecordFromRecordController<Record extends SomeRecordController> = {
  name: Record['name']
  schema: Record['schema']['shape']
  codec: Record['_']['codecs']
  extensions: Omit<Record, 'symbol' | 'create' | 'name' | 'schema' | 'encode' | 'decode' | 'is' | '$is'>
  defaults: null extends Record['_']['defaultsProvider']
    ? null
    : ReturnType<Exclude<Record['_']['defaultsProvider'], null>>
}
