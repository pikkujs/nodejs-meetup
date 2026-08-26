import {
  WhatsAppGatewayAdapter,
  WhatsappService,
  whatsappSecretsSchema,
} from '@pikku/addon-whatsapp'
import type { GatewayAdapter } from '#pikku/gateway'
import { wireGateway } from '#pikku/gateway'
import { askByWhatsApp } from './ask-by-whatsapp.function.js'

/**
 * Refuses everything, for a deploy that never set the credentials.
 *
 * The alternative is throwing from the factory, which would stop the server
 * booting — and every meetup that does not want WhatsApp would then have to
 * delete this file to start the night. An unset secret means the door is shut,
 * not that the building is condemned.
 */
const closedAdapter: GatewayAdapter = {
  name: 'whatsapp',
  parse: () => null,
  send: async () => {},
  init: async () => {},
  close: async () => {},
  verifyWebhook: async () => ({ verified: false }),
}

wireGateway({
  name: 'whatsapp',
  type: 'webhook',
  platform: 'whatsapp',
  route: '/gateway/whatsapp',
  description: 'Questions texted in by anyone who cannot reach the venue wifi.',
  func: askByWhatsApp,
  adapter: async ({ secrets, logger }) => {
    const secret = await secrets.getSecret('WHATSAPP_CREDENTIALS').catch(() => null)
    if (!secret) {
      logger.info('WHATSAPP_CREDENTIALS is unset — the WhatsApp gateway will refuse every message.')
      return closedAdapter
    }

    const credentials = whatsappSecretsSchema.parse(secret.reveal())
    return new WhatsAppGatewayAdapter(
      new WhatsappService(credentials),
      credentials.verifyToken,
      credentials.appSecret,
    )
  },
})
