"use client";

import { Check, Battery, Zap, Weight, Ruler, DollarSign, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/lib/configurator-store";
import { batteries, type Battery as BatteryType } from "@/lib/product-data";

export function Step4Battery() {
  const { selectedMotor, selectedController, selectedBattery, setBattery, nextStep, prevStep } =
    useConfigStore();

  // Get motor voltage (extract number from string like "48V")
  const motorVoltage = selectedMotor?.voltage
    ? parseInt(selectedMotor.voltage.replace("V", ""))
    : 0;

  // Get controller max current (for motors with external controllers)
  const controllerCurrent = selectedController?.continuousCurrent || 0;

  // Filter batteries based on:
  // 1. Battery voltage must match motor voltage
  // 2. Battery continuous discharge >= controller max current (if external controller)
  const filteredBatteries = batteries
    .filter((battery) => {
      const voltageMatch = battery.voltageNum === motorVoltage;
      const currentMatch = selectedMotor?.controllerRequired
        ? battery.continuousDischarge >= controllerCurrent
        : true;
      return voltageMatch && currentMatch;
    })
    .sort((a, b) => b.capacity - a.capacity); // Sort by capacity descending

  const handleSelect = (battery: BatteryType) => {
    setBattery(battery);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Battery</h2>
        <p className="text-muted-foreground">
          Choose a battery compatible with your {selectedMotor?.voltage} system
          {selectedController && ` (min ${controllerCurrent}A discharge)`}
        </p>
      </div>

      {filteredBatteries.length === 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            No compatible batteries found. Please check your motor and controller selection.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatteries.map((battery) => (
            <Card
              key={battery.model}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg relative",
                selectedBattery?.model === battery.model &&
                  "border-primary ring-2 ring-primary/20 bg-primary/5"
              )}
              onClick={() => handleSelect(battery)}
            >
              {selectedBattery?.model === battery.model && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <CardContent className="p-5">
                {/* Image Placeholder */}
                <div className="w-full h-32 mb-4 rounded-lg bg-secondary flex items-center justify-center border border-border">
                  {battery.image ? (
                    <img src={battery.image} alt={battery.model} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground">{battery.model}</h3>
                  <span className="text-sm text-primary font-medium">
                    {battery.capacity}Ah
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Voltage:</span>
                    <span className="text-foreground font-medium">{battery.voltage}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Discharge:</span>
                    <span className="text-foreground font-medium">
                      {battery.continuousDischarge}A
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Weight className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="text-foreground font-medium">{battery.weight}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Size:</span>
                    <span className="text-foreground font-medium text-xs">
                      {battery.dimensions}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{battery.price}</span>
                  </div>
                  <Button
                    variant={selectedBattery?.model === battery.model ? "default" : "secondary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(battery);
                    }}
                  >
                    {selectedBattery?.model === battery.model ? "Selected" : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="secondary" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button
          size="lg"
          disabled={!selectedBattery}
          onClick={nextStep}
          className="px-8"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
