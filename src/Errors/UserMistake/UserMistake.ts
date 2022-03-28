import { ensurePeriod } from '~/helpers'

export const create = (message: string) => new Error(`Alge User Mistake: ${ensurePeriod(message)}`)
