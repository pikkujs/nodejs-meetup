import { betterAuth } from 'better-auth'
import { actor, ban, fabric } from '@pikku/better-auth'
import { pikkuBetterAuth } from '#pikku/auth'

export const auth = pikkuBetterAuth(async ({ kysely, secrets, variables, emailService }) => {
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
      actor({ secret: SCENARIO_ACTOR_SECRET }),
      ban(),
      fabric({
        publicKey: FABRIC_AUTH_PUBLIC_KEY,
        audience: FABRIC_STAGE_ID,
      }),
    ],
  })
})
