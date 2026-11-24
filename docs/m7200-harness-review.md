# 7000-series harness map review

Preview branch: `codex/7000-series-harness`.

The shared harness map supports mid-drive M7100, M7200 and M7600. Titles and report headings follow the selected catalog motor. The approved `public/system-diagrams/m7200-harness-map.svg` and its coordinate system are unchanged. The latest v0 layout shows the harness directly on Step 6 for these motors; other motors and the hub workflow retain their existing views.

## Five editable cable sections

The user explicitly expanded the requirement from the original verified-links-only behavior to all five port sections. Each section now has an independent editor over its cable artwork, including when its component slots are empty.

| Section | Canonical cable state key | Initial value |
| --- | --- | --- |
| P2 HMI / light / brake | `Display → Motor unit` | Existing HMI value; the old `Display → Motor Unit` alias remains readable |
| P4 rear light | `P4 Rear light harness → Motor unit` | Unspecified until edited |
| P5 speed sensor | `Speed sensor → Motor unit` | Existing configured value, otherwise selected sensor's catalog lead |
| P3 throttle / gear / IoT | `P3 Control harness → Motor unit` | Unspecified until edited |
| P1 battery harness | `Battery cage → Motor unit` | Existing cage-to-motor value, otherwise unspecified |

P2 retains the existing standard/custom/extension editor. The other four popovers provide a validated millimetre input and Save length action using the existing whole-mm 100–3000 mm custom-length validation. All values save through `setCableLength` in metres; no new persistence schema is needed. No catalog cable is assigned by row position, and no shared accessory value is copied to multiple branches.

The P5 configured section length can be overridden without changing the sensor catalog. The catalog lead is displayed separately in the editor and reports. The P1 editable harness section does not turn the battery docking interface into a cable.

Component slots remain product labels or literal lowercase `empty`. Section cable specifications are separate from component selections: five section editors stay available even when individual component slots are empty. Empty slots in the slot summary omit their lengths.

## Reports and persistence

`useReportData` supplies both the slots and the five section specifications to Step 6, Step 7 and the actual PDF generator. The 7000-series cable table now has five matching section rows with independent lengths; unsupported motor and hub cable report paths are unchanged. Unknown connector/pin values remain unspecified. Existing project snapshots and JSON/data export flows continue using the canonical cable state.

## Validation

- Production Next build, TypeScript and 32 tests.
- All three motor models render the shared map and matching report/PDF heading.
- Five independent custom lengths round-trip through project save/reload, appear as five focusable map controls, and reach Step 7 and actual jsPDF output.
- Tests preserve HMI aliases, empty/skipped/third-party slot behavior, catalog sensor values and cable-free docking, plus unsupported motor and hub exclusions.
- Prior browser checks covered the overlay geometry and HMI popover; the five-editor update adds live browser verification before delivery.
