"use client";

import { useConfigStore, type WireConfigurations } from "@/lib/configurator-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Battery,
  Cpu,
  Monitor,
  Zap,
  CircleDot,
  Lightbulb,
  Wifi,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Connector type options for each component
const connectorOptions: Record<keyof WireConfigurations, string[]> = {
  battery: ["XT60", "Anderson", "XT90", "Custom"],
  controller: ["Internal", "Higo 8-pin", "Custom"],
  display: ["Higo 6-pin", "Julet 5-pin", "Custom"],
  throttle: ["Julet 3-pin", "SM-3P", "Higo 3-pin", "Custom"],
  brakeLever: ["Higo 2-pin", "SM-2P", "Julet 2-pin", "Custom"],
  speedSensor: ["SM-3P", "Higo 3-pin", "Custom"],
  torqueSensor: ["Higo 8-pin", "Higo 6-pin", "Custom"],
  lights: ["SM-2P", "XT60", "Custom"],
  iotModule: ["UART 4-pin", "USB", "Custom"],
};

const lengthOptions = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];

// Wire colors for visual connections
const wireColors = {
  power: "#f59e0b", // amber
  drive: "#3b82f6", // blue
  control: "#22c55e", // green
  accessories: "#a855f7", // purple
};

interface ComponentCardProps {
  id: keyof WireConfigurations;
  label: string;
  model?: string;
  spec?: string;
  icon: React.ReactNode;
  wireColor: string;
  wireConfig: { length: number; connector: string };
  onWireChange: (config: { length?: number; connector?: string }) => void;
}

function ComponentCard({
  id,
  label,
  model,
  spec,
  icon,
  wireColor,
  wireConfig,
  onWireChange,
}: ComponentCardProps) {
  const [customLength, setCustomLength] = useState<string>("");
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="relative">
      {/* Wire connector visual */}
      <div 
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-1 rounded-r"
        style={{ backgroundColor: wireColor }}
      />
      <div 
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-card"
        style={{ borderColor: wireColor }}
      />
      
      <div className="bg-card border rounded-lg p-4 shadow-sm ml-2">
        <div className="flex items-start gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${wireColor}20` }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{label}</p>
            {model && <p className="text-sm text-muted-foreground truncate">{model}</p>}
            {spec && <p className="text-xs text-primary mt-0.5">{spec}</p>}
          </div>
        </div>

        {/* Wire Configuration */}
        <div className="mt-3 pt-3 border-t border-dashed space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={wireConfig.connector}
              onValueChange={(value) => onWireChange({ connector: value })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {connectorOptions[id].map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!showCustom ? (
              <Select
                value={wireConfig.length.toString()}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setShowCustom(true);
                  } else {
                    onWireChange({ length: parseFloat(value) });
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lengthOptions.map((len) => (
                    <SelectItem key={len} value={len.toString()} className="text-xs">
                      {len}m
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-xs">
                    Custom...
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-1">
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5"
                  value={customLength}
                  onChange={(e) => setCustomLength(e.target.value)}
                  placeholder="m"
                  className="h-8 text-xs"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    const val = parseFloat(customLength);
                    if (val > 0 && val <= 5) {
                      onWireChange({ length: val });
                    }
                    setShowCustom(false);
                    setCustomLength("");
                  }}
                >
                  OK
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="bg-secondary/30 border border-dashed rounded-lg p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function Step4Diagram() {
  const {
    selectedMotor,
    selectedController,
    selectedBattery,
    selectedDisplay,
    selectedSensors,
    selectedLights,
    selectedThrottle,
    selectedIoTModules,
    wireConfigurations,
    setWireConfig,
    resetWireConfigs,
    nextStep,
    prevStep,
  } = useConfigStore();

  if (!selectedMotor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please select a motor first.</p>
        <Button onClick={prevStep} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const hasIntegratedController = selectedMotor.hasIntegratedController;
  const hasTorqueSensor = selectedSensors.some((s) => s.type === "torque");
  const hasSpeedSensor = selectedSensors.some((s) => s.type === "speed");
  const hasLights = selectedLights.length > 0;
  const hasIoT = selectedIoTModules.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">System Diagram Review</h2>
        <p className="text-muted-foreground">
          Review the electrical system layout and configure wire specifications
        </p>
      </div>

      {/* Main Diagram Container */}
      <div className="bg-secondary/20 rounded-2xl p-6 border">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - POWER & CONTROL */}
          <div className="space-y-6">
            {/* 1. POWER Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: wireColors.power }}
                >
                  1
                </div>
                <h3 className="font-bold text-foreground">POWER</h3>
              </div>
              
              <div className="pl-4 space-y-3 border-l-2" style={{ borderColor: wireColors.power }}>
                {selectedBattery ? (
                  <ComponentCard
                    id="battery"
                    label="Battery"
                    model={selectedBattery.model}
                    spec={`${selectedBattery.voltage}V / ${selectedBattery.capacity}Ah`}
                    icon={<Battery className="w-6 h-6" style={{ color: wireColors.power }} />}
                    wireColor={wireColors.power}
                    wireConfig={wireConfigurations.battery}
                    onWireChange={(config) => setWireConfig("battery", config)}
                  />
                ) : (
                  <EmptySlot label="No battery selected" />
                )}
              </div>
            </div>

            {/* 3. CONTROL Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: wireColors.control }}
                >
                  3
                </div>
                <h3 className="font-bold text-foreground">CONTROL</h3>
              </div>
              
              <div className="pl-4 space-y-3 border-l-2" style={{ borderColor: wireColors.control }}>
                {selectedThrottle ? (
                  <ComponentCard
                    id="throttle"
                    label="Handlebar Throttle"
                    model={selectedThrottle.model}
                    spec={selectedThrottle.type}
                    icon={<CircleDot className="w-6 h-6" style={{ color: wireColors.control }} />}
                    wireColor={wireColors.control}
                    wireConfig={wireConfigurations.throttle}
                    onWireChange={(config) => setWireConfig("throttle", config)}
                  />
                ) : (
                  <EmptySlot label="No throttle selected" />
                )}

                {hasTorqueSensor && (
                  <ComponentCard
                    id="torqueSensor"
                    label="Torque Sensor"
                    model={selectedSensors.find((s) => s.type === "torque")?.model}
                    icon={<Zap className="w-6 h-6" style={{ color: wireColors.control }} />}
                    wireColor={wireColors.control}
                    wireConfig={wireConfigurations.torqueSensor}
                    onWireChange={(config) => setWireConfig("torqueSensor", config)}
                  />
                )}

                {hasSpeedSensor && (
                  <ComponentCard
                    id="speedSensor"
                    label="Speed Sensor"
                    model={selectedSensors.find((s) => s.type === "speed")?.model}
                    icon={<CircleDot className="w-6 h-6" style={{ color: wireColors.control }} />}
                    wireColor={wireColors.control}
                    wireConfig={wireConfigurations.speedSensor}
                    onWireChange={(config) => setWireConfig("speedSensor", config)}
                  />
                )}

                {!selectedThrottle && !hasTorqueSensor && !hasSpeedSensor && (
                  <EmptySlot label="No control components" />
                )}
              </div>
            </div>
          </div>

          {/* Center Column - CONTROLLER HUB */}
          <div className="flex flex-col items-center justify-center">
            {/* Visual wire connections to center */}
            <div className="relative w-full max-w-xs">
              {/* Wire lines decoration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-muted opacity-30" />
              </div>
              
              {/* Central Controller/Motor Hub */}
              <div className="relative z-10 bg-card border-2 border-primary rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-4">
                    {hasIntegratedController ? (
                      <Zap className="w-10 h-10 text-primary" />
                    ) : (
                      <Cpu className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg text-foreground">
                    {hasIntegratedController ? "Motor + Controller" : "Controller"}
                  </h3>
                  
                  {hasIntegratedController ? (
                    <>
                      <p className="text-sm text-muted-foreground mt-1">{selectedMotor.model}</p>
                      <Badge className="mt-2" variant="secondary">Integrated</Badge>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedController?.model || "Not selected"}
                      </p>
                      {selectedController && (
                        <p className="text-xs text-primary mt-1">{selectedController.current}A</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Connection info */}
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground font-medium">
                  THE RULE: Connect the Essentials first.
                </p>
                <p className="text-xs text-muted-foreground">
                  Add Refinements later.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - DRIVE & ACCESSORIES */}
          <div className="space-y-6">
            {/* 2. DRIVE Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-end">
                <h3 className="font-bold text-foreground">DRIVE</h3>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: wireColors.drive }}
                >
                  2
                </div>
              </div>
              
              <div className="pr-4 space-y-3 border-r-2" style={{ borderColor: wireColors.drive }}>
                {/* Motor Card */}
                <div className="relative">
                  <div 
                    className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-1 rounded-l"
                    style={{ backgroundColor: wireColors.drive }}
                  />
                  <div 
                    className="absolute -right-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-card"
                    style={{ borderColor: wireColors.drive }}
                  />
                  
                  <div className="bg-card border rounded-lg p-4 shadow-sm mr-2">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${wireColors.drive}20` }}
                      >
                        <Zap className="w-6 h-6" style={{ color: wireColors.drive }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">
                          {selectedMotor.motorType === "hub" ? "Hub Motor" : "Mid-Drive Motor"}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedMotor.model}</p>
                        <p className="text-xs text-primary mt-0.5">{selectedMotor.torque} Nm</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. ACCESSORIES Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-end">
                <h3 className="font-bold text-foreground">ACCESSORIES</h3>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: wireColors.accessories }}
                >
                  4
                </div>
              </div>
              
              <div className="pr-4 space-y-3 border-r-2" style={{ borderColor: wireColors.accessories }}>
                {/* Display - now in Accessories */}
                {selectedDisplay ? (
                  <div className="relative">
                    <div 
                      className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-1 rounded-l"
                      style={{ backgroundColor: wireColors.accessories }}
                    />
                    <div 
                      className="absolute -right-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-card"
                      style={{ borderColor: wireColors.accessories }}
                    />
                    
                    <div className="bg-card border rounded-lg p-4 shadow-sm mr-2">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${wireColors.accessories}20` }}
                        >
                          <Monitor className="w-6 h-6" style={{ color: wireColors.accessories }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">LCD Screen</p>
                          <p className="text-sm text-muted-foreground">{selectedDisplay.model}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-dashed">
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={wireConfigurations.display.connector}
                            onValueChange={(value) => setWireConfig("display", { connector: value })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {connectorOptions.display.map((opt) => (
                                <SelectItem key={opt} value={opt} className="text-xs">
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={wireConfigurations.display.length.toString()}
                            onValueChange={(value) => setWireConfig("display", { length: parseFloat(value) })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {lengthOptions.map((len) => (
                                <SelectItem key={len} value={len.toString()} className="text-xs">
                                  {len}m
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptySlot label="No display selected" />
                )}

                {/* Lights */}
                {hasLights ? (
                  <div className="relative">
                    <div 
                      className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-1 rounded-l"
                      style={{ backgroundColor: wireColors.accessories }}
                    />
                    <div 
                      className="absolute -right-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-card"
                      style={{ borderColor: wireColors.accessories }}
                    />
                    
                    <div className="bg-card border rounded-lg p-4 shadow-sm mr-2">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${wireColors.accessories}20` }}
                        >
                          <Lightbulb className="w-6 h-6" style={{ color: wireColors.accessories }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">Headlight</p>
                          <p className="text-sm text-muted-foreground">{selectedLights.map((l) => l.model).join(", ")}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-dashed">
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={wireConfigurations.lights.connector}
                            onValueChange={(value) => setWireConfig("lights", { connector: value })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {connectorOptions.lights.map((opt) => (
                                <SelectItem key={opt} value={opt} className="text-xs">
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={wireConfigurations.lights.length.toString()}
                            onValueChange={(value) => setWireConfig("lights", { length: parseFloat(value) })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {lengthOptions.map((len) => (
                                <SelectItem key={len} value={len.toString()} className="text-xs">
                                  {len}m
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* IoT Module */}
                {hasIoT && (
                  <div className="relative">
                    <div 
                      className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-1 rounded-l"
                      style={{ backgroundColor: wireColors.accessories }}
                    />
                    <div 
                      className="absolute -right-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-card"
                      style={{ borderColor: wireColors.accessories }}
                    />
                    
                    <div className="bg-card border rounded-lg p-4 shadow-sm mr-2">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${wireColors.accessories}20` }}
                        >
                          <Wifi className="w-6 h-6" style={{ color: wireColors.accessories }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">IoT Module</p>
                          <p className="text-sm text-muted-foreground">{selectedIoTModules.map((m) => m.model).join(", ")}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-dashed">
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={wireConfigurations.iotModule.connector}
                            onValueChange={(value) => setWireConfig("iotModule", { connector: value })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {connectorOptions.iotModule.map((opt) => (
                                <SelectItem key={opt} value={opt} className="text-xs">
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={wireConfigurations.iotModule.length.toString()}
                            onValueChange={(value) => setWireConfig("iotModule", { length: parseFloat(value) })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {lengthOptions.map((len) => (
                                <SelectItem key={len} value={len.toString()} className="text-xs">
                                  {len}m
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedDisplay && !hasLights && !hasIoT && (
                  <EmptySlot label="No accessories selected" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wire Summary Card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground">Wire Summary</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetWireConfigs}
              className="h-8 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset to Defaults
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
            {selectedBattery && (
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">Battery</p>
                <p className="font-medium">{wireConfigurations.battery.connector}</p>
                <p className="text-xs text-primary">{wireConfigurations.battery.length}m</p>
              </div>
            )}
            {selectedDisplay && (
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">Display</p>
                <p className="font-medium">{wireConfigurations.display.connector}</p>
                <p className="text-xs text-primary">{wireConfigurations.display.length}m</p>
              </div>
            )}
            {selectedThrottle && (
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">Throttle</p>
                <p className="font-medium">{wireConfigurations.throttle.connector}</p>
                <p className="text-xs text-primary">{wireConfigurations.throttle.length}m</p>
              </div>
            )}
            {hasTorqueSensor && (
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">Torque Sensor</p>
                <p className="font-medium">{wireConfigurations.torqueSensor.connector}</p>
                <p className="text-xs text-primary">{wireConfigurations.torqueSensor.length}m</p>
              </div>
            )}
            {hasSpeedSensor && (
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">Speed Sensor</p>
                <p className="font-medium">{wireConfigurations.speedSensor.connector}</p>
                <p className="text-xs text-primary">{wireConfigurations.speedSensor.length}m</p>
              </div>
            )}
            {hasLights && (
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">Lights</p>
                <p className="font-medium">{wireConfigurations.lights.connector}</p>
                <p className="text-xs text-primary">{wireConfigurations.lights.length}m</p>
              </div>
            )}
            {hasIoT && (
              <div className="p-2 bg-secondary/50 rounded">
                <p className="text-xs text-muted-foreground">IoT Module</p>
                <p className="font-medium">{wireConfigurations.iotModule.connector}</p>
                <p className="text-xs text-primary">{wireConfigurations.iotModule.length}m</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Components
        </Button>
        <Button onClick={nextStep}>
          Continue to Drivetrain
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
