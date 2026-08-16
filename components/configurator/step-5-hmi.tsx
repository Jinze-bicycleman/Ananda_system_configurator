"use client";

import { useState } from "react";
import { Grid3X3, List, Check, Monitor, Zap, DollarSign, ImageIcon, Wifi, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/lib/configurator-store";
import { hmis, type HMI } from "@/lib/product-data";

export function Step5HMI() {
  const { selectedController, selectedMotor, selectedBattery, selectedHMI, setHMI, nextStep, prevStep } =
    useConfigStore();
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [wakeupFilter, setWakeupFilter] = useState<boolean | null>(null);

  // Determine the protocol based on controller or integrated motor
  const protocol = selectedController?.protocol || "CAN"; // Default to CAN for integrated controllers
  const batteryVoltage = selectedBattery?.voltageNum || 48;

  // Filter HMIs based on compatibility
  const filteredHMIs = hmis.filter((hmi) => {
    // Check voltage compatibility
    const voltageMatch =
      hmi.voltageNum >= batteryVoltage ||
      hmi.ratedVoltage.includes(`${batteryVoltage}V`) ||
      hmi.ratedVoltage.includes("36V-48V");

    // Check wakeup filter
    const wakeupMatch = wakeupFilter === null || hmi.hasWakeup === wakeupFilter;

    return voltageMatch && wakeupMatch;
  });

  const handleSelect = (hmi: HMI) => {
    setHMI(hmi);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Select HMI & Display</h2>
          <p className="text-muted-foreground">
            Choose a display unit compatible with your {selectedBattery?.voltage || "48V"} system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "secondary"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "secondary"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <List className="w-4 h-4 mr-2" />
            Table
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Wakeup Function:</span>
          <Button
            variant={wakeupFilter === null ? "default" : "secondary"}
            size="sm"
            onClick={() => setWakeupFilter(null)}
          >
            All
          </Button>
          <Button
            variant={wakeupFilter === true ? "default" : "secondary"}
            size="sm"
            onClick={() => setWakeupFilter(true)}
          >
            With Wakeup
          </Button>
          <Button
            variant={wakeupFilter === false ? "default" : "secondary"}
            size="sm"
            onClick={() => setWakeupFilter(false)}
          >
            Without Wakeup
          </Button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHMIs.map((hmi) => (
            <Card
              key={hmi.model}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg relative",
                selectedHMI?.model === hmi.model &&
                  "border-primary ring-2 ring-primary/20 bg-primary/5"
              )}
              onClick={() => handleSelect(hmi)}
            >
              {selectedHMI?.model === hmi.model && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <CardContent className="p-5">
                {/* Image Placeholder */}
                <div className="w-full h-32 mb-4 rounded-lg bg-secondary flex items-center justify-center border border-border">
                  {hmi.image ? (
                    <img src={hmi.image} alt={hmi.model} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Monitor className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground">{hmi.model}</h3>
                  {hmi.hasWakeup && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      Wakeup
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Monitor className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Size:</span>
                    <span className="text-foreground font-medium">{hmi.size}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Radio className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Protocol:</span>
                    <span className="text-foreground font-medium">{hmi.protocol}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Voltage:</span>
                    <span className="text-foreground font-medium">{hmi.ratedVoltage}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Display:</span>
                    <span className="text-foreground font-medium">{hmi.displayTechnology}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{hmi.price}</span>
                  </div>
                  <Button
                    variant={selectedHMI?.model === hmi.model ? "default" : "secondary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(hmi);
                    }}
                  >
                    {selectedHMI?.model === hmi.model ? "Selected" : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Image</TableHead>
                <TableHead className="font-semibold">Model</TableHead>
                <TableHead className="font-semibold">Size</TableHead>
                <TableHead className="font-semibold">Protocol</TableHead>
                <TableHead className="font-semibold">Voltage</TableHead>
                <TableHead className="font-semibold">Display</TableHead>
                <TableHead className="font-semibold">Wakeup</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHMIs.map((hmi) => (
                <TableRow
                  key={hmi.model}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedHMI?.model === hmi.model && "bg-primary/10"
                  )}
                  onClick={() => handleSelect(hmi)}
                >
                  <TableCell>
                    <div className="w-16 h-12 rounded bg-secondary flex items-center justify-center border border-border">
                      {hmi.image ? (
                        <img src={hmi.image} alt={hmi.model} className="w-full h-full object-cover rounded" />
                      ) : (
                        <Monitor className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{hmi.model}</TableCell>
                  <TableCell>{hmi.size}</TableCell>
                  <TableCell>{hmi.protocol}</TableCell>
                  <TableCell>{hmi.ratedVoltage}</TableCell>
                  <TableCell>{hmi.displayTechnology}</TableCell>
                  <TableCell>
                    {hmi.hasWakeup ? (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Yes</span>
                    ) : (
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">No</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">${hmi.price}</TableCell>
                  <TableCell>
                    <Button
                      variant={selectedHMI?.model === hmi.model ? "default" : "secondary"}
                      size="sm"
                    >
                      {selectedHMI?.model === hmi.model ? "Selected" : "Select"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="secondary" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button size="lg" disabled={!selectedHMI} onClick={nextStep} className="px-8">
          Next Step
        </Button>
      </div>
    </div>
  );
}
