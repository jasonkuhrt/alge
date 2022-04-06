import { ensurePeriod } from '~/lib/utils'

export const create = (message: string) => new Error(`Alge User Mistake: ${ensurePeriod(message)}`)
