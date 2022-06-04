import { Alge } from '~/'
import { z } from 'zod'

export const processPathInput = (pathCandidate?: string): string => {
  return pathCandidate === ``
    ? `/`
    : !pathCandidate
    ? `/`
    : !pathCandidate.startsWith(`/`)
    ? `/${pathCandidate}`
    : pathCandidate
}

export const Protocol = z.enum([`https`, `http`, `postgres`, `postgresql`, `mysql`, `mongodb`, `mongodb+srv`])

export const UrlDataBase = z.object({
  protocol: Protocol,
  host: z.string().min(1),
  search: z.record(z.string()),
  path: z.string(),
  port: z.number().int().positive().nullable(),
  hash: z.string().min(1).nullable(),
})

const AuthenticatedUrl = Alge.datum(`AuthenticatedUrl`)
  // TODO rename to shape
  // TOOD add .shapeSchema that accepts zod directly (or just overload)
  .schema(
    UrlDataBase.extend({
      username: z.string().min(1),
      password: z.string().min(1),
    }).shape
  )
  .defaults((input) => {
    return {
      protocol: `https`,
      port: null,
      hash: null,
      search: {},
      path: processPathInput(input?.path),
    }
  })
  .done()

AuthenticatedUrl.create({
  host: `foo`,
  username: `black`,
  password: `sheep`,
})

const Url = Alge.data(`Url`).variant(`PublicUrl`).schema(UrlDataBase.shape).variant(AuthenticatedUrl).done()

Url.AuthenticatedUrl.create({
  host: `foo`,
  username: `black`,
  password: `sheep`,
})
