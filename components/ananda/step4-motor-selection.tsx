"use client"

import { useAnandaStore } from "@/lib/ananda-store"
import { useAnandaProductData } from "./product-data-provider"
import { driveTypeToMotorType } from "@/lib/ananda-db-types"
import { StepHeader, EmptyState } from "./ui-primitives"
import { ProductCard } from "./product-card"
import { ProductSpecificationModal, useSpecificationModal } from "./product-specification-modal"

export function Step4MotorSelection() {
  const s = useAnandaStore()
  const { motors, loading, error } = useAnandaProductData()
  const specModal = useSpecificationModal()

  const targetMotorType = driveTypeToMotorType(s.driveType)

  const filtered = motors.filter(m => {
    if (m.motor_type !== targetMotorType) return false
    if (s.voltagePlatform && m.voltage_v !== s.voltagePlatform) return false
    return true
  })

  const hasNoMotors = filtered.length === 0

  return (
    <div>
      <StepHeader
        step={5}
        title="Motor Selection"
        subtitle="Choose the motor architecture for this e-bike system. This affects the motor product list, controller requirements, and system wiring."
      />

      {loading ? (
        <div className="border border-border p-12 text-center">
          <p className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider">Loading motors…</p>
        </div>
      ) : error ? (
        <EmptyState title="Unable to Load Motors" description={error} />
      ) : hasNoMotors ? (
        <EmptyState
          title="No Motors Available"
          description="No motors match the current combination of drive type and voltage platform. Please adjust your selection in the previous steps."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(m => (
            <ProductCard
              key={m.id}
              product={m}
              productType="motor"
              selected={s.motorId === m.id}
              onSelect={() => {
                s.setField("motorId", m.id)
                // Reset downstream controller if we're switching to an integrated-controller motor
                if (m.controller_requirement === "integrated") {
                  s.setField("controllerId", null)
                }
              }}
              onCheckSpecification={() => specModal.open(m, "motor")}
            />
          ))}
        </div>
      )}

      <ProductSpecificationModal
        product={specModal.product}
        productType={specModal.productType}
        isOpen={specModal.isOpen}
        onClose={specModal.close}
      />
    </div>
  )
}
