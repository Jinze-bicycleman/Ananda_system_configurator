import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const ROOTS = ["components", "app", "lib"]
const SKIP = ["components/admin", "app/admin", "components/ui", "lib/admin", "lib/i18n"]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (SKIP.some((s) => p.startsWith(s))) continue
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (/\.(tsx?|mjs)$/.test(name)) out.push(p)
  }
  return out
}

const keys = new Map()
const re = /\bt\(\s*("(?:[^"\\]|\\.)*"|`(?:[^`\\$]|\\.)*`)/g
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8")
    for (const m of src.matchAll(re)) {
      const raw = m[1]
      const value = JSON.parse(raw.startsWith("`") ? JSON.stringify(raw.slice(1, -1)) : raw)
      if (!keys.has(value)) keys.set(value, file)
    }
  }
}
const out = [...keys.entries()].map(([k, f]) => ({ key: k, file: f }))
console.log(JSON.stringify(out, null, 1))
