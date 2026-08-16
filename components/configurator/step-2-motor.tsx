"use client";

import { useState } from "react";
import { Check, Star, ChevronDown, ChevronUp, ImageIcon, Zap, Cog, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { motors, getMotorsByBikeType, getMidDriveMotors, getHubMotors } from "@/lib/product-data";
import type { Motor, MotorType } from "@/lib/product-data";

export function Step2Motor() {
  const { 
    bikeType, 
    motorType, 
    setMotorType,
    voltagePlatform, 
    setVoltagePlatform, 
    selectedMotor, 
    setMotor, 
    nextStep, 
    prevStep 
  } = useConfigStore();
  const [showLegacy, setShowLegacy] = useState(false);

  // Filter motors by bike type and motor type
  const compatibleMotors = bikeType ? getMotorsByBikeType(bikeType) : motors;
  const filteredByType = compatibleMotors.filter((m) => m.motorType === motorType);

  // Separate 7000 series (recommended) from legacy/hub series
  const recommendedMotors = filteredByType.filter((m) => m.series === "7000");
  const otherMotors = filteredByType.filter((m) => m.series === "Legacy");

  const handleSelect = (motor: Motor) => {
    setMotor(motor);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Motor</h2>
        <p className="text-muted-foreground">
          Choose your motor type and model for your e-bike system
        </p>
      </div>

      {/* Motor Type Selection - Prominent Banner */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <CardContent className="py-8">
          <h3 className="text-lg font-semibold text-center text-foreground mb-6">Choose Motor Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Mid-Drive Option */}
            <div
              onClick={() => setMotorType("mid-drive")}
              className={cn(
                "relative cursor-pointer rounded-xl p-6 transition-all duration-200 border-2",
                motorType === "mid-drive"
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              )}
            >
              {motorType === "mid-drive" && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center",
                  motorType === "mid-drive" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <Cog className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground">Mid-Drive</h4>
                  <Badge variant={motorType === "mid-drive" ? "default" : "secondary"} className="mt-1">Recommended</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Motor at crank provides natural riding feel with gear multiplication for better hill climbing and efficiency.
              </p>
            </div>

            {/* Hub Motor Option */}
            <div
              onClick={() => setMotorType("hub")}
              className={cn(
                "relative cursor-pointer rounded-xl p-6 transition-all duration-200 border-2",
                motorType === "hub"
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              )}
            >
              {motorType === "hub" && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center",
                  motorType === "hub" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <Circle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground">Hub Motor</h4>
                  <Badge variant={motorType === "hub" ? "default" : "secondary"} className="mt-1">Simple</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Direct drive in wheel hub offers simple installation and quiet operation, ideal for flat terrain commuting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voltage Platform Selection - Only for Mid-Drive 7000 Series */}
      {motorType === "mid-drive" && (
        <Card className="border-primary/20">
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-center text-foreground mb-4">Choose Your Voltage Platform</h3>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div
                onClick={() => setVoltagePlatform(36)}
                className={cn(
                  "relative cursor-pointer rounded-xl p-5 transition-all duration-200 border-2 text-center",
                  voltagePlatform === 36
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {voltagePlatform === 36 && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <p className="text-3xl font-bold text-foreground">36V</p>
                <p className="text-sm text-muted-foreground mt-1">Lighter, economical</p>
              </div>
              <div
                onClick={() => setVoltagePlatform(48)}
                className={cn(
                  "relative cursor-pointer rounded-xl p-5 transition-all duration-200 border-2 text-center",
                  voltagePlatform === 48
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {voltagePlatform === 48 && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <p className="text-3xl font-bold text-foreground">48V</p>
                <p className="text-sm text-muted-foreground mt-1">Higher power, performance</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Battery options will be filtered to match your selected voltage platform
            </p>
          </CardContent>
        </Card>
      )}

      {/* 7000 Series - Recommended (Mid-Drive only) */}
      {motorType === "mid-drive" && recommendedMotors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-accent fill-accent" />
            <h3 className="text-lg font-semibold text-foreground">7000 Series</h3>
            <Badge className="bg-accent text-accent-foreground">Recommended</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedMotors.map((motor) => (
              <MotorCard
                key={motor.id}
                motor={motor}
                isSelected={selectedMotor?.id === motor.id}
                onSelect={() => handleSelect(motor)}
                isRecommended
              />
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table - Only for Mid-Drive */}
      {motorType === "mid-drive" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">7000 Series Advantages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>7000 Series</TableHead>
                  <TableHead>Legacy Series</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Max Torque</TableCell>
                  <TableCell className="text-primary font-semibold">Up to 120 Nm</TableCell>
                  <TableCell className="text-muted-foreground">Up to 80 Nm</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">IOT Connection</TableCell>
                  <TableCell className="text-primary font-semibold">Available</TableCell>
                  <TableCell className="text-muted-foreground">Not available</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Warranty</TableCell>
                  <TableCell className="text-primary font-semibold">3 Years</TableCell>
                  <TableCell className="text-muted-foreground">2 Years</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bracket Compatibility</TableCell>
                  <TableCell className="text-primary font-semibold">Bosch Compatible</TableCell>
                  <TableCell className="text-muted-foreground">Standard</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Hub Motor Note */}
      {motorType === "hub" && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Note:</span> Hub motors apply torque directly to the wheel. 
            Gear ratio affects pedal cadence only, not motor torque multiplication.
          </p>
        </div>
      )}

      {/* Hub Motors / Legacy Motors */}
      {otherMotors.length > 0 && (
        <div className="border border-border rounded-lg">
          <button
            className="w-full p-4 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
            onClick={() => setShowLegacy(!showLegacy)}
          >
            <span className="font-medium text-foreground">
              {motorType === "hub" ? "Hub Motors" : "Legacy Series"} ({otherMotors.length} models available)
            </span>
            {showLegacy ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {(showLegacy || motorType === "hub") && (
            <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherMotors.map((motor) => (
                <MotorCard
                  key={motor.id}
                  motor={motor}
                  isSelected={selectedMotor?.id === motor.id}
                  onSelect={() => handleSelect(motor)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button size="lg" disabled={!selectedMotor} onClick={nextStep} className="px-8">
          Next: Select Components
        </Button>
      </div>
    </div>
  );
}

function MotorCard({
  motor,
  isSelected,
  onSelect,
  isRecommended = false,
}: {
  motor: Motor;
  isSelected: boolean;
  onSelect: () => void;
  isRecommended?: boolean;
}) {
  // Use square layout for 7000 series motors
  const isSquareLayout = motor.series === "7000";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg relative overflow-hidden",
        isSelected && "border-primary ring-2 ring-primary/20",
        isRecommended && "shadow-lg shadow-primary/10 border-primary/30"
      )}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-full p-1 z-10">
          <Check className="w-4 h-4" />
        </div>
      )}
      {isRecommended && (
        <div className="absolute top-0 right-0 z-10">
          <Badge className="rounded-none rounded-bl-lg bg-accent text-accent-foreground">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Recommended
          </Badge>
        </div>
      )}
      <CardContent className={cn("p-5", isSquareLayout && "p-4")}>
        {/* Image - Square and larger for 7000 series */}
        <div 
          className={cn(
            "w-full bg-secondary rounded-lg flex items-center justify-center border border-border overflow-hidden",
            isSquareLayout ? "aspect-square mb-4" : "h-32 mb-4"
          )}
        >
          {motor.imageUrl ? (
            <img 
              src={motor.imageUrl} 
              alt={motor.model} 
              className={cn(
                "object-contain",
                isSquareLayout ? "w-full h-full p-2" : "max-h-full"
              )} 
            />
          ) : (
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-foreground">{motor.model}</h3>
            <Badge variant="secondary" className="text-xs">
              {motor.motorType === "hub" ? "Hub" : motor.series}
            </Badge>
          </div>

          {/* Motor Description */}
          {motor.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {motor.description}
            </p>
          )}

          <div className={cn("grid gap-3 text-sm", isSquareLayout ? "grid-cols-2" : "grid-cols-3")}>
            <div>
              <span className="text-muted-foreground">Voltage:</span>
              <p className="font-semibold text-foreground">
                {motor.series === "7000" ? "36V/48V" : `${motor.voltage}V`}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Torque:</span>
              <p className="font-semibold text-foreground">{motor.torque} Nm</p>
            </div>
            <div>
              <span className="text-muted-foreground">Weight:</span>
              <p className="font-semibold text-foreground">{motor.weight} kg</p>
            </div>
            {motor.peakPower && (
              <div>
                <span className="text-muted-foreground">Peak Power:</span>
                <p className="font-semibold text-foreground">{motor.peakPower}</p>
              </div>
            )}
          </div>

          {motor.hasIntegratedController && (
            <Badge variant="outline" className="w-full justify-center mt-2">
              <Zap className="w-3 h-3 mr-1" />
              Integrated Controller
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
