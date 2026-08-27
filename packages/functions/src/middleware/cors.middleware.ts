import { cors } from '@pikku/core/middleware'
import { pikkuMiddleware, addHTTPMiddleware } from '#pikku/middleware'
import { allowedOrigins } from '../lib/cors-origins.js'

const corsMiddleware = pikkuMiddleware(
  async ({ variables, ...services }, { http, ...wire }, next) => {
    const middleware = cors({
      origin: await allowedOrigins(variables),
      credentials: true,
      headers: ['Content-Type', 'Authorization', 'X-Auth-Return-Redirect'],
    })
    await middleware({ variables, ...services }, { http, ...wire }, next)
  },
)

addHTTPMiddleware('*', [corsMiddleware])
