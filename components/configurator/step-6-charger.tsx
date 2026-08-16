"use client";

import { Check, BatteryCharging, Zap, DollarSign, Plug, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/lib/configurator-store";
import { chargers, type Charger } from "@/lib/product-data";

const plugOptions = ["All", "Chinese", "US", "EU"] as const;

export function Step6Charger() {
  const {
    selectedBattery,
    selectedCharger,
    setCharger,
    plugFilter,
    setPlugFilter,
    nextStep,
    prevStep,
  } = useConfigStore();

  // Get battery voltage
  const batteryVoltage = selectedBattery?.voltageNum || 0;

  // Filter chargers based on battery voltage and plug filter
  const filteredChargers = chargers.filter((charger) => {
    const voltageMatch = charger.compatibleVoltage === batteryVoltage;
    const plugMatch =
      !plugFilter || plugFilter === "All" || charger.plugStandard.includes(plugFilter);
    return voltageMatch && plugMatch;
  });

  const handleSelect = (charger: Charger) => {
    setCharger(charger);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Charger</h2>
        <p className="text-muted-foreground">
          Choose a charger for your {selectedBattery?.voltage} battery
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <label className="text-sm font-medium text-foreground block mb-3">
          Filter by Plug Standard
        </label>
        <div className="flex flex-wrap gap-2">
          {plugOptions.map((plug) => (
            <Button
              key={plug}
              variant={plugFilter === plug || (!plugFilter && plug === "All") ? "default" : "secondary"}
              size="sm"
              onClick={() => setPlugFilter(plug === "All" ? null : plug)}
              className="px-4"
            >
              <Plug className="w-4 h-4 mr-2" />
              {plug}
            </Button>
          ))}
        </div>
      </div>

      {filteredChargers.length === 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            No compatible chargers found for the selected criteria. Try changing the plug filter.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChargers.map((charger) => (
            <Card
              key={charger.model}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg relative",
                selectedCharger?.model === charger.model &&
                  "border-primary ring-2 ring-primary/20 bg-primary/5"
              )}
              onClick={() => handleSelect(charger)}
            >
              {selectedCharger?.model === charger.model && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <CardContent className="p-5">
                {/* Image Placeholder */}
                <div className="w-full h-32 mb-4 rounded-lg bg-secondary flex items-center justify-center border border-border">
                  {charger.image ? (
                    <img src={charger.image} alt={charger.model} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-bold text-lg text-foreground">{charger.model}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Power:</span>
                    <span className="text-foreground font-medium">{charger.power}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Plug className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Plug:</span>
                    <span className="text-foreground font-medium">
                      {charger.plugStandard.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{charger.price}</span>
                  </div>
                  <Button
                    variant={selectedCharger?.model === charger.model ? "default" : "secondary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(charger);
                    }}
                  >
                    {selectedCharger?.model === charger.model ? "Selected" : "Select"}
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
          disabled={!selectedCharger}
          onClick={nextStep}
          className="px-8"
        >
          Review Configuration
        </Button>
      </div>
    </div>
  );
}
