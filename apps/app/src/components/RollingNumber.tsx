import { useEffect, useRef, useState, type CSSProperties, type FC } from 'react'
import { asI18n } from '@/i18n/messages'

/**
 * A number that rolls to its new value instead of snapping to it.
 *
 * Why bother: a vote count that changes silently while you are reading the
 * question next to it does not register at all. The movement is the message —
 * something happened, here, just now — and it is the only cue the board gets,
 * because a push arrives with no tap of yours to explain it.
 *
 * HOW IT WORKS. Each digit column is a vertical strip of 0–9 translated by
 * `-digit * 100%`. Changing the transform animates the strip, so the digit
 * visibly travels through the values between old and new rather than cutting.
 * `overflow: hidden` on the column crops it to one digit tall.
 *
 * DIRECTION MATTERS. Rising counts roll UP, falling counts roll DOWN, which is
 * the whole reason this is not a fade. It is implemented by the sign of the
 * translate delta and needs no extra state — the strip simply moves the short
 * way, and the short way is the true direction.
 *
 * FIXED-WIDTH DIGITS. The font is monospace and every column is `1ch`, so 9 → 10
 * grows the number by exactly one column and nothing beside it reflows. A
 * proportional font here would nudge the question text sideways on every vote.
 */

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

interface RollingNumberProps {
  value: number
  /** Matches the surrounding text; the strip and the crop window both scale from it. */
  fontSize?: CSSProperties['fontSize']
  fontWeight?: CSSProperties['fontWeight']
  /** Line height in `em`. The crop window is exactly this tall. */
  lineHeight?: number
  color?: string
  /** Announced to screen readers instead of the digit soup a strip would read as. */
  label?: string
}

export const RollingNumber: FC<RollingNumberProps> = ({
  value,
  fontSize = 'inherit',
  fontWeight = 600,
  lineHeight = 1.2,
  color,
  label,
}) => {
  // Digits are padded to a common length so column N always means the same place
  // value. Without this, 9 → 10 would roll the units column from 9 to 1, which
  // reads as a decrease of a number that went up.
  const text = String(Math.max(0, Math.round(value)))
  const [previous, setPrevious] = useState(text)
  const width = Math.max(text.length, previous.length)
  const target = text.padStart(width, '0')

  useEffect(() => {
    setPrevious(text)
  }, [text])

  // The very first paint must not animate: a board that loads with 4 votes should
  // show 4, not roll from 0 to 4 on every page load. Animation begins on the
  // second render, once there is a real previous value to move away from.
  const settled = useRef(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      settled.current = true
    })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <span
      // The live value for assistive tech. The visual strip contains 0–9 ten
      // times over and is meaningless read aloud, so it is hidden and this is
      // announced instead.
      role="status"
      aria-label={label ? `${label}: ${text}` : text}
      style={{
        display: 'inline-flex',
        fontFamily: 'var(--mantine-font-family-monospace)',
        fontSize,
        fontWeight,
        lineHeight,
        color,
        // A digit column carries no meaning on its own; the accessible name above
        // is the whole content, so keep the columns out of the reading order.
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {target.split('').map((digit, index) => (
        <span
          key={`${width}-${index}`}
          aria-hidden
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            height: `${lineHeight}em`,
            width: '1ch',
          }}
        >
          <span
            style={{
              display: 'block',
              transform: `translateY(-${Number(digit) * lineHeight}em)`,
              transition: settled.current
                ? 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'none',
            }}
          >
            {DIGITS.map((candidate) => (
              <span key={candidate} style={{ display: 'block', height: `${lineHeight}em` }}>
                {asI18n(candidate)}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}
