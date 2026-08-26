import { wireAddon } from '#pikku/addon'

/**
 * WhatsApp, wired but not offered.
 *
 * Nothing in the app's UI reaches this. It is here because the gateway in
 * src/gateways/ needs the addon's `WhatsAppGatewayAdapter` and its
 * `WHATSAPP_CREDENTIALS` secret to exist, and because a meetup app is a fair
 * place to show that a second way into the same functions costs one file rather
 * than a rewrite.
 *
 * A deploy with no `WHATSAPP_CREDENTIALS` set is a deploy where the gateway
 * refuses every inbound message, which is the correct state for every meetup
 * that never asked for it — see the note in src/gateways/whatsapp.gateway.ts.
 */
wireAddon({
  name: 'whatsapp',
  package: '@pikku/addon-whatsapp',
})
