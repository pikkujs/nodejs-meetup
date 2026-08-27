import { useEffect, useRef, useState, type CSSProperties, type FC } from 'react'
import { asI18n } from '@/i18n/messages'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

interface RollingNumberProps {
  value: number
  fontSize?: CSSProperties['fontSize']
  fontWeight?: CSSProperties['fontWeight']
  lineHeight?: number
  color?: string
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
  const text = String(Math.max(0, Math.round(value)))
  const [previous, setPrevious] = useState(text)
  const width = Math.max(text.length, previous.length)
  const target = text.padStart(width, '0')

  useEffect(() => {
    setPrevious(text)
  }, [text])

  const settled = useRef(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      settled.current = true
    })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <span
      role="status"
      aria-label={label ? `${label}: ${text}` : text}
      style={{
        display: 'inline-flex',
        fontFamily: 'var(--mantine-font-family-monospace)',
        fontSize,
        fontWeight,
        lineHeight,
        color,
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
