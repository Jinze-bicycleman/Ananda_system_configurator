"use client"

import { useState } from "react"
import { useAnandaStore } from "@/lib/ananda-store"
import { aSensors } from "@/lib/ananda-data"
import { useAnandaProductData } from "./product-data-provider"
import { specOrConfirm } from "@/lib/ananda-db-types"
import { StepHeader, SectionLabel, TechSpecRow, EmptyState } from "./ui-primitives"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import { CheckCircle2, Image as ImageIcon, Info } from "lucide-react"

function SmallProductCard({
  id, name, imageUrl, description,
  specs, selected, onSelect, badge,
}: {
  id: string; name: string; imageUrl?: string | null; description?: string | null
  specs?: { label: string; value: string | null }[]
  selected: boolean; onSelect: () => void
  badge?: "required" | "optional"
}) {
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer border-2 overflow-hidden transition-all",
        selected ? "border-primary shadow-md shadow-primary/10" : "border-border hover:border-primary/40"
      )}
    >
      <div className={cn("h-1 w-full", selected ? "bg-primary" : "bg-border")} />
      {selected && (
        <div className="absolute top-2 right-2 z-10 bg-primary rounded-full p-0.5">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
      {badge && (
        <div className="absolute top-2 left-2 z-10">
          <StatusBadge variant={badge} />
        </div>
      )}

      {/* Image */}
      <div className={cn(
        "relative flex items-center justify-center h-28 overflow-hidden",
        selected ? "bg-primary/5" : "bg-surface"
      )}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 112" preserveAspectRatio="none">
          <polygon points="120,0 200,0 200,112 80,112" fill={selected ? "#008F36" : "#f3f4f6"} opacity={selected ? "0.12" : "0.5"} />
        </svg>
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={name}
            className="relative z-10 max-h-20 object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-1">
            <ImageIcon className={cn("w-8 h-8", selected ? "text-primary/40" : "text-border")} />
            <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground">{id}</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className={cn("text-sm font-sans font-bold uppercase mb-1", selected ? "text-primary" : "text-graphite")}>{name}</p>
        {description && <p className="text-[11px] font-body text-muted-foreground leading-relaxed mb-2">{description}</p>}
        {specs && specs.length > 0 && (
          <div className="border border-border rounded-sm overflow-hidden">
            {specs.map(sp => (
              <TechSpecRow key={sp.label} label={sp.label} value={sp.value} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function Step5SystemComponents() {
  const s = useAnandaStore()
  const isHub = s.driveType === "hub"
  const isMid = s.driveType === "mid"
  const { controllers, hmiDisplays, loading, error } = useAnandaProductData()

  const availableControllers = controllers.filter(c =>
    (c.compatible_motor_type === "hub" || c.compatible_motor_type === "both") &&
    (s.voltagePlatform ? c.voltage_v === s.voltagePlatform : true)
  )

  const availableDisplays = hmiDisplays.filter(d =>
    d.voltage_v == null || (s.voltagePlatform ? d.voltage_v === s.voltagePlatform : true)
  )

  const speedSensor   = aSensors.find(x => x.sensorType === "speed")
  const torqueSensor  = aSensors.find(x => x.sensorType === "torque")
  const cadenceSensor = aSensors.find(x => x.sensorType === "cadence")

  return (
    <div>
      <StepHeader
        step={6}
        title="Required System Components"
        subtitle="Configure controller, sensors and HMI for the selected drive system. Items shown are filtered to your voltage platform."
      />

      {/* ─── CONTROLLER ─── */}
      <section className="mb-8">
        <SectionLabel>Controller</SectionLabel>
        {isMid ? (
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 px-5 py-4 rounded-sm">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-sans font-semibold text-primary">Controller not required as a separate component.</p>
              <p className="text-sm font-body text-muted-foreground mt-1">
                The selected mid-drive system uses an integrated controller or matched internal drive electronics.
              </p>
              <div className="mt-2"><StatusBadge variant="integrated" label="Controller Integrated" /></div>
            </div>
          </div>
        ) : (
          <>
            {isHub && !s.controllerId && (
              <div className="mb-3 flex items-center gap-2 text-sm font-body text-warning bg-warning/10 border border-warning/30 px-4 py-2 rounded-sm">
                <Info className="w-4 h-4 flex-shrink-0" />
                A controller is required for hub motor systems.
              </div>
            )}
            {loading ? (
              <div className="border border-border p-8 text-center">
                <p className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider">Loading controllers…</p>
              </div>
            ) : error ? (
              <EmptyState title="Unable to Load Controllers" description={error} />
            ) : availableControllers.length === 0 ? (
              <EmptyState title="No Controllers Available" description="No controllers match the selected voltage platform. Please adjust your selection in the previous steps." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableControllers.map(c => (
                  <SmallProductCard
                    key={c.id} id={c.id} name={c.model}
                    imageUrl={c.image_url}
                    description={c.short_description}
                    specs={[
                      { label: "Rated Current", value: specOrConfirm(c.rated_current_a, "A") },
                      { label: "Voltage", value: specOrConfirm(c.voltage_v, "V") },
                      // Weight intentionally omitted for controllers
                    ]}
                    selected={s.controllerId === c.id}
                    onSelect={() => s.setField("controllerId", c.id)}
                    badge="required"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ─── PEDAL SENSING ─── */}
      <section className="mb-8">
        <SectionLabel>Pedal Sensing</SectionLabel>
        {isMid ? (
          /* Mid-drive: sensors are integrated — show info card only, no product options */
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 px-5 py-4 rounded-sm">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-sans font-semibold text-primary">
                Torque and cadence sensing are integrated in the selected mid-drive system. External torque and cadence sensors are not required.
              </p>
              <p className="text-sm font-body text-muted-foreground mt-1">
                External torque and cadence sensors are not required.
              </p>
              <div className="flex gap-2 mt-2">
                <StatusBadge variant="integrated" label="Torque Sensing" />
                <StatusBadge variant="integrated" label="Cadence Sensing" />
              </div>
            </div>
          </div>
        ) : (
          /* Hub motor: external sensors required */
          <>
            <div className="mb-3 flex items-start gap-2 text-sm font-body text-muted-foreground bg-surface border-l-2 border-primary px-4 py-3">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              Hub motor systems require external pedal input sensing. Please select a torque sensor or cadence sensor depending on the intended riding feel and system requirements.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {torqueSensor && (
                <SmallProductCard
                  id={torqueSensor.id} name={torqueSensor.name}
                  imageUrl={torqueSensor.imageUrl}
                  description={torqueSensor.description}
                  specs={[]}
                  selected={s.torqueSensorId === torqueSensor.id}
                  onSelect={() => s.setField("torqueSensorId", s.torqueSensorId === torqueSensor.id ? null : torqueSensor.id)}
                  badge="required"
                />
              )}
              {cadenceSensor && (
                <SmallProductCard
                  id={cadenceSensor.id} name={cadenceSensor.name}
                  imageUrl={cadenceSensor.imageUrl}
                  description={cadenceSensor.description}
                  specs={[]}
                  selected={s.cadenceSensorId === cadenceSensor.id}
                  onSelect={() => s.setField("cadenceSensorId", s.cadenceSensorId === cadenceSensor.id ? null : cadenceSensor.id)}
                  badge="optional"
                />
              )}
            </div>
          </>
        )}
      </section>

      {/* ─── SPEED SENSOR (shown for both hub and mid-drive) ─── */}
      <section className="mb-8">
        <SectionLabel>Speed Sensor</SectionLabel>
        <div className="mb-3 flex items-start gap-2 text-sm font-body text-muted-foreground bg-surface border-l-2 border-primary px-4 py-3">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          Speed sensing is required for assistance control, speed limit compliance and system feedback.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {speedSensor && (
            <SmallProductCard
              id={speedSensor.id} name={speedSensor.name}
              imageUrl={speedSensor.imageUrl}
              description={speedSensor.description}
              specs={[]}
              selected={s.speedSensorId === speedSensor.id}
              onSelect={() => s.setField("speedSensorId", s.speedSensorId === speedSensor.id ? null : speedSensor.id)}
              badge="required"
            />
          )}
        </div>
      </section>

      {/* ─── HMI — DISPLAYS ─── */}
      <section className="mb-8">
        <SectionLabel>HMI — Display</SectionLabel>
        {loading ? (
          <div className="border border-border p-8 text-center">
            <p className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider">Loading displays…</p>
          </div>
        ) : error ? (
          <EmptyState title="Unable to Load Displays" description={error} />
        ) : availableDisplays.length === 0 ? (
          <EmptyState title="No Displays Available" description="No HMI displays match the selected voltage platform. Please adjust your selection in the previous steps." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableDisplays.map(d => (
              <SmallProductCard
                key={d.id} id={d.id} name={d.model}
                imageUrl={d.image_url}
                description={d.short_description}
                specs={[
                  { label: "Size", value: specOrConfirm(d.size) },
                  { label: "Display Material", value: specOrConfirm(d.display_material) },
                  { label: "Connection Type", value: specOrConfirm(d.connection_type) },
                  { label: "Comm. Protocol", value: specOrConfirm(d.communication_protocol) },
                  { label: "Bluetooth", value: specOrConfirm(d.bluetooth_status) },
                  { label: "Waterproof", value: specOrConfirm(d.waterproof) },
                ]}
                selected={s.hmiDisplayId === d.id}
                onSelect={() => s.setField("hmiDisplayId", s.hmiDisplayId === d.id ? null : d.id)}
                badge="optional"
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
