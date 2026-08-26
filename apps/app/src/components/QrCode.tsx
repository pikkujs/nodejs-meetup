import { useMemo, type FC } from 'react'
import qrcode from 'qrcode-generator'

/** Four modules of white on every side. The spec's number; scanners rely on it. */
const QUIET_ZONE = 4

/**
 * A QR code, drawn as one SVG path.
 *
 * Rendered rather than fetched because the room's wifi is the thing this code
 * exists to route around — a QR poster that needs the network to appear is a poster
 * that fails exactly when it is needed. `qrcode-generator` is ~10KB and does the
 * whole job offline.
 *
 * One path, not one `<rect>` per module: a v4 code is ~1300 modules, and 1300 DOM
 * nodes on a projected page is a visible cost for no gain.
 *
 * Error correction 'M' (~15%): the poster is on a wall or a laptop screen, not on a
 * greasy pizza box, and lower correction means larger modules for the same physical
 * size, which is what actually matters at four metres.
 */
export const QrCode: FC<{ value: string; size?: number | string; label?: string }> = ({
  value,
  /** Any CSS length. The projector passes a `min(vh, vw)` so it fits a 16:9 frame. */
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
      // Runs, not squares: consecutive dark modules on a row collapse into one
      // horizontal bar, which roughly halves the path without changing a pixel.
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
      // The viewBox is in MODULES, so the code is resolution-independent and the
      // caller picks a size in pixels without any of this needing to know.
      viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${count + QUIET_ZONE * 2} ${count + QUIET_ZONE * 2}`}
      role="img"
      aria-label={label ?? value}
      shapeRendering="crispEdges"
      style={{ display: 'block', borderRadius: 8 }}
    >
      {/* The quiet zone is white and opaque on purpose. A QR code on a dark
          background does not scan on half the phones in the room, and tonight is
          not the night to find out which half. */}
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
