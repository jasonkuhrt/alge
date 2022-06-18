/**
 * @see https://semver.org/
 */
import { Alge } from '../src/index.js'
import semver from 'semver'
import semverUtils from 'semver-utils'
import { z } from 'zod'

type SemVerInferred = Alge.Infer<typeof SemVer>

export type SemVer = SemVerInferred['*']

export namespace SemVer {
  export type Exact = SemVerInferred['Exact']
  export type Range = SemVerInferred['Range']
}

const schemaAliases = {
  semverPatchMinorMajor: z.number().int().nonnegative(),
}

export const SemVer = Alge.data(`SemVer`)
  .variant(`Exact`)
  .schema({
    major: schemaAliases.semverPatchMinorMajor,
    minor: schemaAliases.semverPatchMinorMajor,
    patch: schemaAliases.semverPatchMinorMajor,
    release: z.string().nullable(), // TODO regexp,
    build: z.string().nullable(), // TODO regexp,
  })
  .codec({
    decode: (rawVersion) => {
      const result = semverUtils.parse(rawVersion)
      // incorrect static type from lib, can be null!
      if (result === null) return null
      const { major, minor, patch, build = null, release = null } = result

      if (!major || !minor || !patch) {
        return null
      }

      return {
        major: Number(major),
        minor: Number(minor),
        patch: Number(patch),
        release,
        build,
      }
    },
    encode: (version) =>
      // prettier-ignore
      `${version.major}.${version.minor}.${version.patch}${version.release ? `-${version.release}` : ``}${version.build ? `+${version.build}` : ``}`,
  })
  .variant(`Range`)
  .schema({
    parts: z.array(
      z.union([
        z.object({
          major: z.union([schemaAliases.semverPatchMinorMajor, z.literal(`*`), z.null()]),
          minor: z.union([
            schemaAliases.semverPatchMinorMajor,
            z.literal(`*`),
            z.literal(`x`),
            z.literal(`X`),
            z.null(),
          ]),
          patch: z.union([
            schemaAliases.semverPatchMinorMajor,
            z.literal(`*`),
            z.literal(`x`),
            z.literal(`X`),
            z.null(),
          ]),
          release: z.string().nullable(), // TODO regex
          build: z.string().nullable(), // TODO regex
          operator: z.union([
            z.literal(`>`),
            z.literal(`<`),
            z.literal(`<=`),
            z.literal(`>=`),
            z.literal(`=`),
            z.literal(`~`),
            z.literal(`^`),
            z.null(),
          ]),
        }),
        z.object({
          operator: z.literal(`||`),
        }),
        z.object({
          operator: z.literal(`-`),
        }),
      ])
    ),
  })
  // TODO find a way to allow referring to static types in extensions...
  // .extend({
  //   maxSatisfying: (
  //     // TODO Exact[]
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     versions: any[],
  //     // TODO Range
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     range: any
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   ): SemVer.Exact => {
  //     const result = semver.maxSatisfying(
  //       //eslint-disable-next-line
  //       versions.map((_) => _.raw),
  //       //eslint-disable-next-line
  //       SemVer.Range.encode(range)
  //     )
  //     if (!result) return null
  //     return SemVer.Exact.decodeOrThrow(result)
  //   },
  // })
  .codec({
    decode: (value, { schema }) => {
      const versions = semverUtils.parseRange(value)

      if (versions.length === 0) return null

      const partsRaw = versions.map(
        ({
          semver = ``,
          major = null,
          minor = null,
          patch = null,
          build = null,
          release = null,
          operator = null,
        }) => {
          return {
            raw: semver,
            major,
            minor,
            patch,
            build,
            release,
            operator: operator,
          }
        }
      )

      const result = schema._def.shape().parts.safeParse({ parts: partsRaw })

      if (!result.success) return null // TODO allow returning zod error

      return {
        parts: result.data,
      }
    },
    encode: (range) => range.parts.join(` `),
  })
  .done()

// Helpers

export const maxSatisfying = (versions: SemVer.Exact[], range: SemVer.Range): null | SemVer.Exact => {
  const result = semver.maxSatisfying(versions.map(SemVer.Exact.encode), SemVer.Range.encode(range))
  if (!result) return null
  return SemVer.Exact.decodeOrThrow(result)
}
