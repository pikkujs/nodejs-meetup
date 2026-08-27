import messages from '../../../../apps/app/messages/en.json' with { type: 'json' }

export type MessageKey = keyof typeof messages

export const copy = (key: MessageKey): string => messages[key]
