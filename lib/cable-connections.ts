/** Canonical cable-state boundary. Read old saved projects without rewriting them. */
export const HMI_CONNECTION = "Display → Motor unit"
const LEGACY_HMI_CONNECTION = "Display → Motor Unit"

export function canonicalCableConnection(connection: string): string {
  return connection === LEGACY_HMI_CONNECTION ? HMI_CONNECTION : connection
}

export function cableValue<T>(values: Record<string, T>, connection: string): T | undefined {
  const key = canonicalCableConnection(connection)
  return values[key] ?? (key === HMI_CONNECTION ? values[LEGACY_HMI_CONNECTION] : undefined)
}

export function writeCableValue<T>(values: Record<string, T>, connection: string, value: T): Record<string, T> {
  const next = { ...values, [canonicalCableConnection(connection)]: value }
  if (canonicalCableConnection(connection) === HMI_CONNECTION) delete next[LEGACY_HMI_CONNECTION]
  return next
}
