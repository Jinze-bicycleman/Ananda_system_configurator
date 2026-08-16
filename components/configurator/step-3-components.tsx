"use client";

import { ImageIcon, Battery, Cpu, Monitor, Settings, Circle, Check, Lightbulb, Gauge, Radio, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/lib/configurator-store";
import {
  displays,
  chainrings,
  sensors,
  lights,
  throttles,
  iotModules,
  getCompatibleControllers,
  getCompatibleBatteriesByVoltage,
  getCompatibleDisplays,
  getCompatibleCranks,
  getCrankTypeForMotor,
} from "@/lib/product-data";

export function Step3Components() {
  const {
    selectedMotor,
    voltagePlatform,
    selectedController,
    selectedBattery,
    selectedDisplay,
    selectedChainring,
    selectedCrank,
    selectedSensors,
    selectedLights,
    selectedThrottle,
    selectedIoTModules,
    setController,
    setBattery,
    setDisplay,
    setChainring,
    setCrank,
    toggleSensor,
    toggleLight,
    setThrottle,
    toggleIoTModule,
    nextStep,
    prevStep,
    getTotalWeight,
  } = useConfigStore();

  if (!selectedMotor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please select a motor first.</p>
        <Button onClick={prevStep} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // Filter compatible components
  const compatibleControllers = getCompatibleControllers(selectedMotor.id);
  // Filter batteries by motor voltage
  const motorVoltage = selectedMotor.series === "7000" ? voltagePlatform : selectedMotor.voltage;
  const compatibleBatteries = getCompatibleBatteriesByVoltage(selectedMotor.id, motorVoltage as 36 | 48);
  const compatibleDisplays = getCompatibleDisplays(selectedMotor);

  // Skip controller selection if motor has integrated controller
  const needsExternalController = !selectedMotor.hasIntegratedController;
  // All components are now optional
  const canProceed = true;
  const totalWeight = getTotalWeight();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Components</h2>
        <p className="text-muted-foreground">
          Choose compatible components for your {selectedMotor.model} motor
        </p>
      </div>

      {/* Weight Summary Bar */}
      <Card className="bg-gradient-to-r from-primary/10 via-transparent to-primary/10 border-primary/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total System Weight</span>
            <span className="text-2xl font-bold text-primary">{totalWeight} kg</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controller Selection */}
        {needsExternalController ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="w-5 h-5 text-primary" />
                Controller
                <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* No Controller Option */}
              <div
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 relative",
                  !selectedController && "border-primary bg-primary/5"
                )}
                onClick={() => setController(null)}
              >
                {!selectedController && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-muted-foreground opacity-50" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">No Controller</p>
                    <p className="text-xs text-muted-foreground">Customer will source their own controller</p>
                  </div>
                </div>
              </div>

              {compatibleControllers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No compatible controllers found</p>
              ) : (
                compatibleControllers.map((ctrl) => (
                  <div
                    key={ctrl.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 relative",
                      selectedController?.id === ctrl.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setController(ctrl)}
                  >
                    {selectedController?.id === ctrl.id && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{ctrl.model}</p>
                        <p className="text-xs text-muted-foreground">
                          {ctrl.current}A / {ctrl.voltage} / {ctrl.weight} kg
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Integrated Controller</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMotor.model} has an integrated controller
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Battery Selection - Now Optional */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Battery className="w-5 h-5 text-primary" />
              Battery
              <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {motorVoltage}V batteries compatible with your motor
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* No Battery Option */}
            <div
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 relative",
                !selectedBattery && "border-primary bg-primary/5"
              )}
              onClick={() => setBattery(null)}
            >
              {!selectedBattery && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                  <Battery className="w-6 h-6 text-muted-foreground opacity-50" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">No Battery</p>
                  <p className="text-xs text-muted-foreground">Customer will source their own battery</p>
                </div>
              </div>
            </div>
            
            {/* Battery Options */}
            {compatibleBatteries.map((bat) => (
              <div
                key={bat.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 relative",
                  selectedBattery?.id === bat.id && "border-primary bg-primary/5"
                )}
                onClick={() => setBattery(bat)}
              >
                {selectedBattery?.id === bat.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                    <Battery className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{bat.capacityWh} Wh</p>
                    <p className="text-xs text-muted-foreground">
                      {bat.voltage}V / {bat.capacity}Ah / Max {bat.discharge}A / {bat.weight} kg
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Display Selection (Optional) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="w-5 h-5 text-primary" />
              Display
              <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 flex items-center justify-center min-h-[120px]",
                  !selectedDisplay && "border-primary bg-primary/5"
                )}
                onClick={() => setDisplay(null)}
              >
                <p className="text-sm text-muted-foreground">No display</p>
              </div>
              {compatibleDisplays.map((disp) => (
                <div
                  key={disp.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 relative",
                    selectedDisplay?.id === disp.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setDisplay(disp)}
                >
                  {selectedDisplay?.id === disp.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 z-10">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="w-full aspect-square bg-secondary rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {disp.imageUrl ? (
                      <img src={disp.imageUrl} alt={disp.model} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Monitor className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground text-sm">{disp.model}</p>
                    <p className="text-xs text-muted-foreground">{disp.weight} kg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sensors Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="w-5 h-5 text-primary" />
              Sensors
              <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sensors.map((sensor) => {
              const isSelected = selectedSensors.some((s) => s.id === sensor.id);
              return (
                <div
                  key={sensor.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 flex items-center gap-3",
                    isSelected && "border-primary bg-primary/5"
                  )}
                  onClick={() => toggleSensor(sensor)}
                >
                  <Checkbox checked={isSelected} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{sensor.name}</p>
                    <p className="text-xs text-muted-foreground">Weight: {sensor.weight} kg</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Lights Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-5 h-5 text-primary" />
              Lights
              <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lights.map((light) => {
              const isSelected = selectedLights.some((l) => l.id === light.id);
              return (
                <div
                  key={light.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 flex items-center gap-3",
                    isSelected && "border-primary bg-primary/5"
                  )}
                  onClick={() => toggleLight(light)}
                >
                  <Checkbox checked={isSelected} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{light.name}</p>
                    <p className="text-xs text-muted-foreground">Weight: {light.weight} kg</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Throttle Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Power className="w-5 h-5 text-primary" />
              Throttle
              <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 flex items-center gap-3",
                !selectedThrottle && "border-primary bg-primary/5"
              )}
              onClick={() => setThrottle(null)}
            >
              <Checkbox checked={!selectedThrottle} />
              <div className="flex-1">
                <p className="font-medium text-foreground">No Throttle</p>
                <p className="text-xs text-muted-foreground">Pedal-assist only</p>
              </div>
            </div>
            {throttles.map((throttle) => (
              <div
                key={throttle.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 flex items-center gap-3",
                  selectedThrottle?.id === throttle.id && "border-primary bg-primary/5"
                )}
                onClick={() => setThrottle(throttle)}
              >
                <Checkbox checked={selectedThrottle?.id === throttle.id} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{throttle.model}</p>
                  <p className="text-xs text-muted-foreground">Weight: {throttle.weight} kg</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* IoT Modules Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="w-5 h-5 text-primary" />
              IoT Modules
              <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {iotModules.map((module) => {
              const isSelected = selectedIoTModules.some((m) => m.id === module.id);
              return (
                <div
                  key={module.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 flex items-center gap-3",
                    isSelected && "border-primary bg-primary/5"
                  )}
                  onClick={() => toggleIoTModule(module)}
                >
                  <Checkbox checked={isSelected} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{module.name}</p>
                    <p className="text-xs text-muted-foreground">Weight: {module.weight} kg</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Chainring Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="w-5 h-5 text-primary" />
              Chainring
              <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant={!selectedChainring ? "default" : "secondary"} onClick={() => setChainring(null)}>
                None
              </Button>
              {chainrings.map((ring) => (
                <Button
                  key={ring.id}
                  variant={selectedChainring?.id === ring.id ? "default" : "secondary"}
                  onClick={() => setChainring(ring)}
                >
                  {ring.teeth}T ({ring.weight}kg)
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crank Selection (Optional) - Only for mid-drive */}
        {selectedMotor.motorType === "mid-drive" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Circle className="w-5 h-5 text-primary" />
                Crank Type & Length
                <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
              </CardTitle>
              {getCrankTypeForMotor(selectedMotor.id) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {getCrankTypeForMotor(selectedMotor.id)} mounting required for {selectedMotor.model}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant={!selectedCrank ? "default" : "secondary"} onClick={() => setCrank(null)}>
                  None
                </Button>
                {getCompatibleCranks(selectedMotor.id).map((crank) => (
                  <Button
                    key={crank.id}
                    variant={selectedCrank?.id === crank.id ? "default" : "secondary"}
                    onClick={() => setCrank(crank)}
                  >
                    {crank.length}mm ({crank.weight}kg)
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selection Summary */}
      <Card className="bg-card border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Selection Summary</span>
            <span className="text-primary text-lg font-bold">{totalWeight} kg total</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <SummaryLine label="Motor" value={`${selectedMotor.model} (${selectedMotor.weight}kg)`} />
          {selectedMotor.hasIntegratedController ? (
            <SummaryLine label="Controller" value="Integrated" />
          ) : selectedController ? (
            <SummaryLine label="Controller" value={`${selectedController.model} (${selectedController.weight}kg)`} />
          ) : (
            <SummaryLine label="Controller" value="Not selected" muted />
          )}
          {selectedBattery ? (
            <SummaryLine label="Battery" value={`${selectedBattery.capacityWh}Wh (${selectedBattery.weight}kg)`} />
          ) : (
            <SummaryLine label="Battery" value="No battery" muted />
          )}
          {selectedDisplay && <SummaryLine label="Display" value={`${selectedDisplay.model} (${selectedDisplay.weight}kg)`} />}
          {selectedSensors.length > 0 && <SummaryLine label="Sensors" value={selectedSensors.map((s) => s.name).join(", ")} />}
          {selectedLights.length > 0 && <SummaryLine label="Lights" value={selectedLights.map((l) => l.name).join(", ")} />}
          {selectedThrottle && <SummaryLine label="Throttle" value={selectedThrottle.model} />}
          {selectedIoTModules.length > 0 && <SummaryLine label="IoT" value={selectedIoTModules.map((m) => m.name).join(", ")} />}
          {selectedChainring && <SummaryLine label="Chainring" value={`${selectedChainring.teeth}T`} />}
          {selectedCrank && <SummaryLine label="Crank" value={`${selectedCrank.length}mm (${selectedCrank.crankType})`} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button size="lg" disabled={!canProceed} onClick={nextStep} className="px-8">
          Next: Drivetrain Analysis
        </Button>
      </div>
    </div>
  );
}

function SummaryLine({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground italic" : "text-foreground font-medium"}>{value}</span>
    </div>
  );
}
