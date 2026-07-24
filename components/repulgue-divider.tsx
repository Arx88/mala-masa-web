/**
 * Divisor con festón tipo borde de empanada entre dos secciones.
 * `from` es el fondo de la sección superior, `to` el de la inferior.
 */
export function RepulgueDivider({
  from = 'var(--background)',
  to = 'var(--secondary)',
}: {
  from?: string
  to?: string
}) {
  return (
    <div aria-hidden="true" style={{ backgroundColor: to }}>
      <div
        className="repulgue"
        style={{ '--repulgue-color': from } as React.CSSProperties}
      />
    </div>
  )
}
