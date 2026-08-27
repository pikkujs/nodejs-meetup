import { useMemo, type FC } from 'react'
import qrcode from 'qrcode-generator'

const QUIET_ZONE = 4

export const QrCode: FC<{ value: string; size?: number | string; label?: string }> = ({
  value,
  size = 320,
  label,
}) => {
  const { path, count } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(value)
    qr.make()

    const modules = qr.getModuleCount()
    const segments: string[] = []
    for (let row = 0; row < modules; row++) {
      let runStart = -1
      for (let col = 0; col <= modules; col++) {
        const dark = col < modules && qr.isDark(row, col)
        if (dark && runStart < 0) {
          runStart = col
        } else if (!dark && runStart >= 0) {
          segments.push(`M${runStart} ${row}h${col - runStart}v1h-${col - runStart}z`)
          runStart = -1
        }
      }
    }
    return { path: segments.join(''), count: modules }
  }, [value])

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${count + QUIET_ZONE * 2} ${count + QUIET_ZONE * 2}`}
      role="img"
      aria-label={label ?? value}
      shapeRendering="crispEdges"
      style={{ display: 'block', borderRadius: 8 }}
    >
      <rect
        x={-QUIET_ZONE}
        y={-QUIET_ZONE}
        width={count + QUIET_ZONE * 2}
        height={count + QUIET_ZONE * 2}
        fill="#ffffff"
      />
      <path d={path} fill="#000000" />
    </svg>
  )
}
