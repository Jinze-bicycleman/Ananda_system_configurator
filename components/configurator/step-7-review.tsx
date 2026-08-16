"use client";

import { useState } from "react";
import {
  Save,
  Trash2,
  FileDown,
  RefreshCw,
  Check,
  Cog,
  Battery,
  BatteryCharging,
  Cpu,
  DollarSign,
  Weight,
  MapPin,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useConfigStore } from "@/lib/configurator-store";
import {
  calculateTotalPrice,
  calculateTotalWeight,
  estimateRange,
  type Solution,
} from "@/lib/product-data";
import { cn } from "@/lib/utils";
import type { Regulation } from "@/lib/product-data";

const regulationNames: Record<Regulation, string> = {
  "us-cat1": "US Category 1",
  "us-cat2": "US Category 2",
  "eu-ebike": "EU E-Bike",
  "jis": "JIS (Japan)",
  "canada": "Canada",
};

export function Step7Review() {
  const {
    bikeType,
    loadType,
    wheelSize,
    driveSystem,
    motorSystem,
    regulation,
    speedLimit,
    selectedMotor,
    selectedController,
    selectedBattery,
    selectedHMI,
    selectedCharger,
    solutions,
    saveSolution,
    deleteSolution,
    resetConfiguration,
    prevStep,
  } = useConfigStore();

  const [solutionName, setSolutionName] = useState("");
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([]);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const isComplete =
    bikeType && selectedMotor && selectedBattery && selectedHMI && selectedCharger;

  const currentConfig = isComplete
    ? {
        bikeType,
        loadType,
        wheelSize,
        driveSystem,
        motorSystem,
        regulation,
        speedLimit,
        motor: selectedMotor,
        controller: selectedController,
        battery: selectedBattery,
        hmi: selectedHMI,
        charger: selectedCharger,
      }
    : null;

  const totalPrice = currentConfig ? calculateTotalPrice(currentConfig) : 0;
  const totalWeight = currentConfig ? calculateTotalWeight(currentConfig) : "0kg";
  const range =
    selectedBattery && selectedMotor
      ? estimateRange(selectedBattery, selectedMotor)
      : "N/A";

  const handleSave = () => {
    if (solutionName.trim() && isComplete) {
      saveSolution(solutionName.trim());
      setSolutionName("");
      setSaveDialogOpen(false);
    }
  };

  const toggleSolutionSelection = (id: string) => {
    setSelectedSolutions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const comparisonSolutions = solutions.filter((s) =>
    selectedSolutions.includes(s.id)
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review & Save Configuration
        </h2>
        <p className="text-muted-foreground">
          Review your complete powertrain configuration and save it for
          comparison
        </p>
      </div>

      {/* Requirements Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">System Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Bike Type:</span>
              <p className="font-medium text-foreground capitalize">{bikeType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Load:</span>
              <p className="font-medium text-foreground capitalize">{loadType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Wheel:</span>
              <p className="font-medium text-foreground">{wheelSize}&quot;</p>
            </div>
            <div>
              <span className="text-muted-foreground">Drive:</span>
              <p className="font-medium text-foreground capitalize">{driveSystem}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Motor Type:</span>
              <p className="font-medium text-foreground capitalize">{motorSystem}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Regulation:</span>
              <p className="font-medium text-foreground">{regulationNames[regulation]}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Speed:</span>
              <p className="font-medium text-foreground">{speedLimit} km/h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Summary */}
      <Card className="border-primary/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Cog className="w-5 h-5 text-primary" />
            Selected Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Motor */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cog className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Motor
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {selectedMotor?.model || "Not selected"}
              </p>
              {selectedMotor && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {selectedMotor.voltage} / {selectedMotor.torque}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Type {selectedMotor.mountingType} / {selectedMotor.shaftType}
                  </p>
                </>
              )}
            </div>

            {/* Controller */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Controller
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {selectedController?.model ||
                  (selectedMotor && !selectedMotor.controllerRequired
                    ? "Integrated"
                    : "Not selected")}
              </p>
              {selectedController && (
                <p className="text-sm text-muted-foreground">
                  {selectedController.continuousCurrent}A /{" "}
                  {selectedController.protocol}
                </p>
              )}
            </div>

            {/* Battery */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Battery className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Battery
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {selectedBattery?.model || "Not selected"}
              </p>
              {selectedBattery && (
                <p className="text-sm text-muted-foreground">
                  {selectedBattery.capacity}Ah / {selectedBattery.voltage}
                </p>
              )}
            </div>

            {/* HMI */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  HMI & Display
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {selectedHMI?.model || "Not selected"}
              </p>
              {selectedHMI && (
                <p className="text-sm text-muted-foreground">
                  {selectedHMI.size} / {selectedHMI.displayTechnology}
                </p>
              )}
            </div>

            {/* Charger */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BatteryCharging className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Charger
                </span>
              </div>
              <p className="font-semibold text-foreground">
                {selectedCharger?.model || "Not selected"}
              </p>
              {selectedCharger && (
                <p className="text-sm text-muted-foreground">
                  {selectedCharger.power}
                </p>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold text-foreground">
                  ${totalPrice}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <Weight className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Weight</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalWeight}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Range</p>
                <p className="text-2xl font-bold text-foreground">{range}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!isComplete} className="gap-2">
              <Save className="w-4 h-4" />
              Save as Solution
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Enter solution name (e.g., Cargo Economic)"
                value={solutionName}
                onChange={(e) => setSolutionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setSaveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!solutionName.trim()}>
                  Save Solution
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="secondary" onClick={resetConfiguration} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Start New Configuration
        </Button>
      </div>

      {/* Saved Solutions */}
      {solutions.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Saved Solutions ({solutions.length})</CardTitle>
              <div className="flex gap-2">
                <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      disabled={selectedSolutions.length < 2}
                      className="gap-2"
                    >
                      Compare ({selectedSolutions.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        <span>Solution Comparison</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handlePrint}
                          className="gap-2"
                        >
                          <FileDown className="w-4 h-4" />
                          Export PDF
                        </Button>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="print:p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Specification</TableHead>
                            {comparisonSolutions.map((s) => (
                              <TableHead key={s.id}>{s.name}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              Total Price
                            </TableCell>
                            {comparisonSolutions.map((s) => (
                              <TableCell key={s.id}>
                                ${calculateTotalPrice(s)}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Total Weight
                            </TableCell>
                            {comparisonSolutions.map((s) => (
                              <TableCell key={s.id}>
                                {calculateTotalWeight(s)}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Motor</TableCell>
                            {comparisonSolutions.map((s) => (
                              <TableCell key={s.id}>{s.motor.model}</TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Controller
                            </TableCell>
                            {comparisonSolutions.map((s) => (
                              <TableCell key={s.id}>
                                {s.controller?.model || "Integrated"}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Battery
                            </TableCell>
                            {comparisonSolutions.map((s) => (
                              <TableCell key={s.id}>{s.battery.model}</TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              HMI
                            </TableCell>
                            {comparisonSolutions.map((s) => (
                              <TableCell key={s.id}>{s.hmi.model}</TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Charger
                            </TableCell>
                            {comparisonSolutions.map((s) => (
                              <TableCell key={s.id}>{s.charger.model}</TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              Est. Range
                            </TableCell>
                            {comparisonSolutions.map((s) => (
                              <TableCell key={s.id}>
                                {estimateRange(s.battery, s.motor)}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {solutions.map((solution) => (
                <Card
                  key={solution.id}
                  className={cn(
                    "transition-all",
                    selectedSolutions.includes(solution.id) &&
                      "ring-2 ring-primary"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedSolutions.includes(solution.id)}
                          onCheckedChange={() =>
                            toggleSolutionSelection(solution.id)
                          }
                        />
                        <h4 className="font-semibold text-foreground">
                          {solution.name}
                        </h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSolution(solution.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Motor:</span>
                        <span className="text-foreground">
                          {solution.motor.model}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Battery:</span>
                        <span className="text-foreground">
                          {solution.battery.model}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">HMI:</span>
                        <span className="text-foreground">
                          {solution.hmi.model}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-medium text-muted-foreground">
                          Total:
                        </span>
                        <span className="font-bold text-primary">
                          ${calculateTotalPrice(solution)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="secondary" size="lg" onClick={prevStep}>
          Back
        </Button>
        {isComplete && (
          <div className="flex items-center gap-2 text-primary">
            <Check className="w-5 h-5" />
            <span className="font-medium">Configuration Complete</span>
          </div>
        )}
      </div>
    </div>
  );
}
