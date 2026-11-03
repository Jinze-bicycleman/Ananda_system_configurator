import { DATA_SECTIONS } from "./catalog-data"
import type { CatalogSection } from "./catalog-types"
import { UI_SECTIONS } from "./catalog-ui"

export type { CatalogSection } from "./catalog-types"

export const CATALOG_SECTIONS: CatalogSection[] = [...UI_SECTIONS, ...DATA_SECTIONS]

/** Flat English → Chinese lookup of every bundled default. */
export const ZH_DEFAULTS: Record<string, string> = Object.assign({}, ...CATALOG_SECTIONS.map((section) => section.entries))
