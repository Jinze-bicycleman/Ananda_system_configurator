export interface CatalogSection {
  title: string
  /** English source text mapped to its bundled Chinese default. */
  entries: Record<string, string>
}
