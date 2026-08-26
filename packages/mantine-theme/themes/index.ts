// One JSON per theme. Each bundles a `brand` (colours + fonts) and a
// `structure` (radius/shadows/spacing) section.
//
// `meetup` is this app's own theme and the active one — the direction and the
// reasoning behind it are in knowledge/decisions/design/two-viewing-distances.md.
// `default` (the template's Neutral) is kept as the light-room fallback and so the
// theme switcher has something to switch to.
import t_default from './default.json'
import t_meetup from './meetup.json'

export const themeSpecs: Record<string, unknown> = {
  meetup: t_meetup,
  default: t_default,
}
