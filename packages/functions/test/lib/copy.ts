import messages from '../../../../apps/app/messages/en.json' with { type: 'json' }

/**
 * The words on screen, read from the app's own catalogue.
 *
 * A scenario that asserts `seesText: 'Start the next slot'` passes only while the app
 * renders the base locale and only until somebody edits the copy — at which point it
 * fails as a selector timeout with nothing in it to suggest that a wording change was
 * the cause. Reading the string from the catalogue makes the copy edit invisible to the
 * test and a RENAMED KEY a compile error, which is the failure you can act on.
 *
 * Prefer `testId` over this wherever a control is involved: the testid IS the message
 * key, stamped on at build time, and addressing a control by its meaning beats
 * addressing it by its text in any locale. This is for the cases where the assertion is
 * genuinely about text the room reads — a heading, a status word — and there is no
 * control to point at.
 *
 * Typed off the catalogue on purpose, so `copy('organiser__advanc')` does not compile.
 */
export type MessageKey = keyof typeof messages

export const copy = (key: MessageKey): string => messages[key]
