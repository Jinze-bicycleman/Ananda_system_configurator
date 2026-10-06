"use client"

import { useState } from "react"
import { smoothPath } from "@/lib/bike-overview/geometry"
import { formatLengthCm, type BikeTemplate, type CableKey, type ProductRole } from "@/lib/bike-overview/templates"
import type { ResolvedCable, ResolvedProduct } from "@/lib/bike-overview/use-bike-overview"

const LINE_HEIGHT = 15
const FONT_SIZE = 12

function productLabelLines(role: ProductRole, model: string): string[] {
  switch (role) {
    case "display":
      return [`HMI:${model}`]
    case "battery":
      return ["Battery:", model]
    case "motor":
      return [`Motor:${model}`]
    case "speedSensor":
      return ["Wheel Speed", `Sensor:${model}`]
  }
}

interface BikeCanvasProps {
  template: BikeTemplate
  products: Record<ProductRole, ResolvedProduct | null>
  cables: ResolvedCable[]
  selected: CableKey
  onSelect: (key: CableKey) => void
}

export function BikeCanvas({ template, products, cables, selected, onSelect }: BikeCanvasProps) {
  const [hovered, setHovered] = useState<CableKey | null>(null)
  const { viewBox } = template
  const active = hovered ?? selected

  return (
    <svg
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      role="group"
      aria-label={`${template.name} cable routing overview`}
      className="block h-auto w-full select-none"
    >
      <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} className="fill-white" />

      <image
        href={template.silhouette.src}
        x={template.silhouette.box.x}
        y={template.silhouette.box.y}
        width={template.silhouette.box.w}
        height={template.silhouette.box.h}
        opacity={template.silhouette.opacity}
        preserveAspectRatio={template.silhouette.stretch ? "none" : "xMidYMid slice"}
        aria-hidden="true"
      />

      {template.productOrder.map((role) => {
        const product = products[role]
        if (!product) return null
        const { box } = template.products[role]
        return (
          <image
            key={role}
            href={product.src}
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            preserveAspectRatio="xMidYMid meet"
            opacity={product.isReference ? 0.55 : 1}
          >
            <title>{`${role}: ${product.model}`}</title>
          </image>
        )
      })}

      {cables.filter((c) => c.visible).map((cable) => {
        const d = smoothPath(cable.placement.points)
        const isActive = cable.key === active
        const dimmed = !isActive
        return (
          <g key={cable.key} opacity={dimmed ? 0.55 : 1}>
            {isActive && (
              <path d={d} fill="none" stroke="white" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
            )}
            <path
              d={d}
              fill="none"
              stroke={cable.meta.stroke}
              strokeWidth={isActive ? 4 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )
      })}

      {cables.filter((c) => c.visible && c.placement.leader).map((cable) => {
        const l = cable.placement.leader!
        return (
          <line
            key={cable.key}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="black"
            strokeWidth={0.75}
            opacity={cable.key === active ? 1 : 0.5}
          />
        )
      })}

      {template.productOrder.map((role) => {
        const product = products[role]
        const label = template.products[role].label
        if (!product || !label) return null
        return (
          <text key={role} x={label.x} y={label.y + FONT_SIZE} fontSize={FONT_SIZE} className="fill-black font-sans">
            {productLabelLines(role, product.model).map((line, i) => (
              <tspan key={line} x={label.x} dy={i === 0 ? 0 : LINE_HEIGHT}>
                {line}
              </tspan>
            ))}
          </text>
        )
      })}

      {cables.filter((c) => c.visible).map((cable) => {
        const { x, y } = cable.placement.label
        const isSelected = cable.key === selected
        const lines = [
          null,
          `connector:${cable.placement.connectorLabel}`,
          `length: ${formatLengthCm(cable.lengthMm)}`,
        ]
        return (
          <g
            key={cable.key}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${cable.meta.title}, ${cable.meta.colorName}, ${formatLengthCm(cable.lengthMm)}. Select to edit.`}
            className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-primary [&:focus-visible>rect]:stroke-[2]"
            onClick={() => onSelect(cable.key)}
            onMouseEnter={() => setHovered(cable.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(cable.key)}
            onBlur={() => setHovered(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect(cable.key)
              }
            }}
          >
            <rect
              x={x - 6}
              y={y - 3}
              width={150}
              height={LINE_HEIGHT * 3 + 6}
              rx={2}
              className={isSelected ? "fill-primary/10 stroke-primary" : "fill-transparent stroke-transparent"}
              strokeWidth={1}
            />
            <text x={x} y={y + FONT_SIZE} fontSize={FONT_SIZE} className="fill-black font-sans">
              {lines.map((line, i) =>
                line === null ? (
                  <tspan key="title" x={x} dy={0}>
                    {cable.meta.title}:{" "}
                    <tspan fill={cable.meta.stroke}>{cable.meta.colorName}</tspan>
                  </tspan>
                ) : (
                  <tspan key={line} x={x} dy={LINE_HEIGHT}>
                    {line}
                  </tspan>
                ),
              )}
            </text>
          </g>
        )
      })}

      {/* Wide invisible strokes so thin cables are easy to hover and click. */}
      {cables.filter((c) => c.visible).map((cable) => (
        <path
          key={cable.key}
          d={smoothPath(cable.placement.points)}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          strokeLinecap="round"
          className="cursor-pointer"
          onClick={() => onSelect(cable.key)}
          onMouseEnter={() => setHovered(cable.key)}
          onMouseLeave={() => setHovered(null)}
        >
          <title>{`${cable.meta.title} (${cable.meta.colorName})`}</title>
        </path>
      ))}
    </svg>
  )
}
