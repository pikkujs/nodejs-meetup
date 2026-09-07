import { betterAuth } from 'better-auth'
import { pikkuActor, pikkuBan, pikkuFabric } from '@pikku/better-auth'
import {
  personaConfigs,
  personaEnvironments,
} from '#pikku/scenarios/pikku-personas.gen.js'
import { pikkuBetterAuth } from '#pikku/auth'

export const auth = pikkuBetterAuth(async ({ kysely, secrets, variables, emailService, scopeService, logger }) => {
  const BETTER_AUTH_SECRET = (await secrets.getSecret('BETTER_AUTH_SECRET')).reveal()
  const SCENARIO_ACTOR_SECRET = (await secrets.getSecret('SCENARIO_ACTOR_SECRET'))?.reveal()
  const FABRIC_AUTH_PUBLIC_KEY = await variables.get('FABRIC_AUTH_PUBLIC_KEY')
  const FABRIC_STAGE_ID = await variables.get('FABRIC_STAGE_ID')

  return betterAuth({
    secret: BETTER_AUTH_SECRET,
    database: { db: kysely, type: 'sqlite' },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        await emailService.send({
          to: user.email,
          template: {
            name: 'reset-password',
            data: { email: user.email, resetUrl: url },
          },
        })
      },
    },
    session: { cookieCache: { enabled: true } },
    advanced: { database: { generateId: 'uuid' } },
    plugins: [
      pikkuActor({ secret: SCENARIO_ACTOR_SECRET }),
      pikkuBan(),
      pikkuFabric({
        publicKey: FABRIC_AUTH_PUBLIC_KEY,
        audience: FABRIC_STAGE_ID,
        scopeService,
        logger,
        personas: {
          personas: personaConfigs,
          environments: personaEnvironments,
        },
      }),
    ],
  })
})
