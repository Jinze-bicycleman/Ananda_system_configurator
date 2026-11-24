# 7000-series harness map review

Current preview branch: `codex/7000-series-harness`.

Scope update: the shared artwork now covers M7100, M7200 and M7600, as requested. Titles and report headings use the selected catalog motor model. The approved asset filename and bytes are unchanged.

The approved SVG is copied byte-for-byte to `public/system-diagrams/m7200-harness-map.svg`. Step 6 resolves the selected catalog motor model and reveals this map for mid-drive M7100, M7200 and M7600 motors, inside the existing confirmation gate. BikeOverview and sourcing controls remain above it. The existing fixed overview remains in a disclosure; unsupported mid-drive models and the hub path retain their existing diagrams.

## Length support

| Drawing branch | Current behavior | Required to enable further editing |
| --- | --- | --- |
| P2 Display / HMI | Editable via the existing named HMI route, standard options and validated custom-length editor | Third-party displays require verified connection compatibility |
| P5 speed sensor | Read-only catalog lead; hidden when skipped or empty | No editing: lead belongs to the selected sensor |
| P1 battery docking | Cable-free interface | No cable length applies |
| P1 cage to motor | Live derived matching battery cage label; length disabled | Verified cage/harness connection and named cable/length-option relationship |
| P2/P3 shared trunks | Length disabled | Explicit trunk connection keys and cable mapping |
| P2 front light and P4 rear light | Live selected accessory labels; lengths disabled | Independent per-branch cable connection keys, compatibility and length options |
| Brakes, throttle, gear sensor, IoT | Empty without a compatible explicit selection | Slot-specific compatible selections and named cable mappings; current throttle records do not verify 7000-series compatibility |

No shared accessory length is copied to individual branches. No catalog cable is assigned to the new drawing by row position. Existing overview cable assignment behavior is retained.

## Data and report behavior

`cable-connections.ts` reads both saved HMI spellings. Canonical lowercase `Motor unit` wins if both exist. Edits write the canonical key and remove the obsolete alias for that value; existing project snapshots remain readable without destructive migration. Lengths remain in metres in state; the drawing and slot summary use mm. Report precision now preserves millimetre edits.

`useReportData` supplies the same harness slots to the map, Step 7 and PDF. Empty slot summaries say literal `empty` and have no length. For these 7000-series cable rows, the speed-sensor length comes from the sensor catalog, empty HMI/sensor rows are omitted, and the cable-free battery docking route is omitted. Other report/export flows remain in place.

## Verification

- TypeScript check, production Next build and 30 tests.
- Tests cover saved HMI aliases, canonical precedence, project save/reload after a custom edit, configured and empty slots, stale selections with skipped/third-party flags, fixed sensor leads, and other motor/drive gating.
- Integration tests render Step 7 and the map and inspect output from the actual jsPDF generator after a 1370 mm edit (1.37 m in the cable table).
- Browser preview with controlled catalog fixtures: confirmation gate, 1235 mm legacy value, focused custom editor, 1370 mm live update, Step 7 agreement, skipped sensor, M7100 fixed overview (before the 7000-series scope expansion), keyboard horizontal scrolling, readable empty slots and lower-left project specification panel. Temporary QA route removed after review.
- SVG byte equality confirmed with `cmp`.

Live Supabase catalog verification was unavailable because this checkout contains no Supabase environment configuration. Fixtures are isolated to tests; no demo product data was added to application code. Existing BikeOverview controls remain intact, including its separately modeled power/sensor routes; their reference/default lengths do not redefine 7000-series docking or the catalog-fixed P5 lead.

The scope expansion has parameterized render/PDF tests for all three models, plus an unsupported M8000 and hub exclusion check. The original browser verification above describes the initial M7200-only scope.

## Cable overlay placement update

Length displays and the HMI editor now sit over the cable drawing in the red-box areas supplied in `m7200-harness-map with red boxes note.png`. Right-hand slots contain component names only. The P2 editor remains explicitly labeled HMI cable and continues to update the verified Display → Motor route; it does not introduce a shared-trunk cable assignment. P5 remains catalog-fixed, P1 docking remains cable-free, and unverified P3/rear-light/cage mappings stay non-editable. Empty component slots have no associated length overlay. The SVG is unchanged.
