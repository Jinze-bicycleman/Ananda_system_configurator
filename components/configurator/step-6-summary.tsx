"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfigStore } from "@/lib/configurator-store";
import { calculateDrivetrain, countries, complianceStandards } from "@/lib/product-data";
import { cn } from "@/lib/utils";
import {
  Save,
  Trash2,
  Download,
  FileText,
  Package,
  Zap,
  TrendingUp,
  RotateCcw,
  Weight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function Step6Summary() {
  const {
    selectedMotor,
    selectedController,
    selectedBattery,
    selectedDisplay,
    selectedChainring,
    selectedCrank,
    selectedSensors,
    selectedLights,
    selectedThrottle,
    selectedIoTModules,
    bikeType,
    tireType,
    country,
    complianceStandard,
    payload,
    speedLimit,
    ridingStyle,
    rearSprocket,
    voltagePlatform,
    savedSolutions,
    saveSolution,
    removeSolution,
    reset,
    prevStep,
    getTotalWeight,
  } = useConfigStore();

  const [solutionName, setSolutionName] = useState("");

  if (!selectedMotor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please complete your configuration first.</p>
        <Button onClick={prevStep} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const chainringTeeth = selectedChainring?.teeth || 42;
  const isHubMotor = selectedMotor.motorType === "hub";
  const totalWeight = getTotalWeight();

  const drivetrainResult = calculateDrivetrain({
    wheelDiameter: 0.7,
    chainringTeeth,
    rearSprocketTeeth: rearSprocket,
    motorTorque: selectedMotor.torque,
    cadenceMin: 60,
    cadenceMax: 100,
    riderWeight: 75,
    bikeWeight: 25,
    payload,
    isHubMotor,
  });

  // Compatibility checks
  const compatibilityChecks = [
    {
      label: "Motor selected",
      passed: !!selectedMotor,
    },
    {
      label: "Controller configured",
      passed: selectedMotor.hasIntegratedController || !!selectedController,
      note: selectedMotor.hasIntegratedController ? "Integrated controller" : undefined,
    },
    {
      label: "Voltage compatibility",
      passed: !selectedBattery || (selectedMotor.series === "7000" 
        ? selectedBattery.voltage === voltagePlatform 
        : selectedBattery.voltage === selectedMotor.voltage),
      note: selectedBattery ? `${selectedBattery.voltage}V battery with ${selectedMotor.series === "7000" ? voltagePlatform : selectedMotor.voltage}V motor` : "No battery selected",
    },
  ];

  const allChecksPassed = compatibilityChecks.every((c) => c.passed);

  const handleSave = () => {
    if (!solutionName.trim()) return;
    saveSolution(solutionName.trim());
    setSolutionName("");
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleStartNew = () => {
    reset();
  };

  const countryName = countries.find((c) => c.code === country)?.name || country;
  const complianceName = complianceStandards.find((s) => s.value === complianceStandard)?.label || complianceStandard;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Summary & Report</h2>
        <p className="text-muted-foreground">
          Review your configuration, check compatibility, and save or export
        </p>
      </div>

      {/* Compatibility Check */}
      <Card className={cn(
        "border-2",
        allChecksPassed ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {allChecksPassed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
            Compatibility Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {compatibilityChecks.map((check, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {check.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
                <span className={cn("text-sm", check.passed ? "text-foreground" : "text-amber-600")}>
                  {check.label}
                </span>
                {check.note && (
                  <span className="text-xs text-muted-foreground">({check.note})</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BOM Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Bill of Materials (BOM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Weight (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Motor</TableCell>
                <TableCell>{selectedMotor.model}</TableCell>
                <TableCell className="text-center">1</TableCell>
                <TableCell className="text-right">{selectedMotor.weight}</TableCell>
              </TableRow>
              {selectedController && (
                <TableRow>
                  <TableCell className="font-medium">Controller</TableCell>
                  <TableCell>{selectedController.model}</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-right">{selectedController.weight}</TableCell>
                </TableRow>
              )}
              {selectedMotor.hasIntegratedController && (
                <TableRow>
                  <TableCell className="font-medium">Controller</TableCell>
                  <TableCell className="text-muted-foreground italic">Integrated</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              )}
              {selectedBattery ? (
                <TableRow>
                  <TableCell className="font-medium">Battery</TableCell>
                  <TableCell>{selectedBattery.capacityWh}Wh ({selectedBattery.voltage}V)</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-right">{selectedBattery.weight}</TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell className="font-medium">Battery</TableCell>
                  <TableCell className="text-muted-foreground italic">Not included</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              )}
              {selectedDisplay && (
                <TableRow>
                  <TableCell className="font-medium">Display</TableCell>
                  <TableCell>{selectedDisplay.model}</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-right">{selectedDisplay.weight}</TableCell>
                </TableRow>
              )}
              {selectedChainring && (
                <TableRow>
                  <TableCell className="font-medium">Chainring</TableCell>
                  <TableCell>{selectedChainring.teeth}T</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-right">{selectedChainring.weight}</TableCell>
                </TableRow>
              )}
              {selectedCrank && (
                <TableRow>
                  <TableCell className="font-medium">Crank</TableCell>
                  <TableCell>{selectedCrank.length}mm ({selectedCrank.crankType})</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-right">{selectedCrank.weight}</TableCell>
                </TableRow>
              )}
              {selectedSensors.map((sensor) => (
                <TableRow key={sensor.id}>
                  <TableCell className="font-medium">Sensor</TableCell>
                  <TableCell>{sensor.name}</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-right">{sensor.weight}</TableCell>
                </TableRow>
              ))}
              {selectedLights.map((light) => (
                <TableRow key={light.id}>
                  <TableCell className="font-medium">Light</TableCell>
                  <TableCell>{light.name}</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-right">{light.weight}</TableCell>
                </TableRow>
              ))}
              {selectedThrottle && (
                <TableRow>
                  <TableCell className="font-medium">Throttle</TableCell>
                  <TableCell>{selectedThrottle.model}</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-right">{selectedThrottle.weight}</TableCell>
                </TableRow>
              )}
              {selectedIoTModules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">IoT Module</TableCell>
                  <TableCell>{module.name}</TableCell>
                  <TableCell className="text-center">1</TableCell>
                  <TableCell className="text-right">{module.weight}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-primary/5 font-bold">
                <TableCell colSpan={3}>Total Weight</TableCell>
                <TableCell className="text-right text-primary">{totalWeight} kg</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<Zap className="w-5 h-5" />}
              label="Motor Torque"
              value={`${selectedMotor.torque} Nm`}
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Max Climb Grade"
              value={`${drivetrainResult.maxClimbGrade}%`}
            />
            <MetricCard
              icon={<Zap className="w-5 h-5" />}
              label="Top Speed"
              value={`${drivetrainResult.theoreticalTopSpeed} km/h`}
            />
            <MetricCard
              icon={<Weight className="w-5 h-5" />}
              label="System Weight"
              value={`${totalWeight} kg`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Country:</span>
              <p className="font-medium text-foreground">{countryName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Compliance:</span>
              <p className="font-medium text-foreground">{complianceName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bike Type:</span>
              <p className="font-medium text-foreground capitalize">{bikeType || "Not set"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tire Type:</span>
              <p className="font-medium text-foreground capitalize">{tireType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Motor Type:</span>
              <p className="font-medium text-foreground capitalize">{selectedMotor.motorType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Payload:</span>
              <p className="font-medium text-foreground">{payload} kg</p>
            </div>
            <div>
              <span className="text-muted-foreground">Speed Limit:</span>
              <p className="font-medium text-foreground">{speedLimit} km/h</p>
            </div>
            <div>
              <span className="text-muted-foreground">Riding Style:</span>
              <p className="font-medium text-foreground capitalize">{ridingStyle}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Gear Ratio:</span>
              <p className="font-medium text-foreground">{drivetrainResult.gearRatio}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Wheel Torque:</span>
              <p className="font-medium text-foreground">{drivetrainResult.wheelTorque} Nm</p>
            </div>
            <div>
              <span className="text-muted-foreground">Chainring:</span>
              <p className="font-medium text-foreground">{chainringTeeth}T</p>
            </div>
            <div>
              <span className="text-muted-foreground">Rear Sprocket:</span>
              <p className="font-medium text-foreground">{rearSprocket}T</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Solution */}
      <Card className="border-2 border-primary/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="solution-name" className="mb-2 block">Save this configuration</Label>
              <div className="flex gap-2">
                <Input
                  id="solution-name"
                  placeholder="Enter a name for this solution..."
                  value={solutionName}
                  onChange={(e) => setSolutionName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <Button onClick={handleSave} disabled={!solutionName.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="secondary" onClick={handleStartNew}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Config
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Solutions Comparison */}
      {savedSolutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Saved Solutions ({savedSolutions.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Motor</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Torque</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedSolutions.map((solution) => (
                    <TableRow key={solution.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {solution.name}
                          <Badge variant="secondary" className="text-xs">
                            {solution.bikeType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{solution.motor.model}</TableCell>
                      <TableCell>{solution.battery ? `${solution.battery.capacityWh}Wh` : "None"}</TableCell>
                      <TableCell>{solution.motor.torque} Nm</TableCell>
                      <TableCell>{solution.totalWeight} kg</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSolution(solution.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {savedSolutions.length >= 2 && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Quick Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Highest Torque:</span>
                    <p className="font-semibold text-primary">
                      {savedSolutions.reduce((max, s) => s.motor.torque > max.motor.torque ? s : max).name} - 
                      {Math.max(...savedSolutions.map(s => s.motor.torque))} Nm
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lightest System:</span>
                    <p className="font-semibold text-primary">
                      {savedSolutions.reduce((min, s) => s.totalWeight < min.totalWeight ? s : min).name} - 
                      {Math.min(...savedSolutions.map(s => s.totalWeight))} kg
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button size="lg" onClick={handleStartNew} className="px-8">
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Configuration
        </Button>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-lg border bg-card text-center">
      <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center bg-secondary text-muted-foreground">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-lg text-foreground">{value}</p>
    </div>
  );
}
