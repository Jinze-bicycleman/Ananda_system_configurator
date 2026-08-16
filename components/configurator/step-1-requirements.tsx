"use client";

import { useEffect } from "react";
import { Package, Building2, Mountain, TrendingUp, Zap, Scale, Globe, Shield, Circle, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/lib/configurator-store";
import { bikeTypeInfo, ridingStyleInfo, countryRegulations, getCountryRegulation } from "@/lib/product-data";
import type { BikeType, RidingStyle, TireType } from "@/lib/product-data";

const bikeTypeIcons: Record<BikeType, React.ReactNode> = {
  cargo: <Package className="w-10 h-10" />,
  city: <Building2 className="w-10 h-10" />,
  mountain: <Mountain className="w-10 h-10" />,
  "fat-tire": <Circle className="w-10 h-10" />,
};

const ridingStyleIcons: Record<RidingStyle, React.ReactNode> = {
  climbing: <TrendingUp className="w-6 h-6" />,
  speed: <Zap className="w-6 h-6" />,
  balanced: <Scale className="w-6 h-6" />,
};

export function Step1Requirements() {
  const {
    country,
    bikeType,
    tireType,
    payload,
    speedLimit,
    ridingStyle,
    setCountry,
    setBikeType,
    setTireType,
    setPayload,
    setSpeedLimit,
    setRidingStyle,
    nextStep,
  } = useConfigStore();

  // Auto-update speed limit when country changes
  const selectedCountryData = getCountryRegulation(country);
  
  useEffect(() => {
    if (selectedCountryData) {
      setSpeedLimit(selectedCountryData.speedLimit);
    }
  }, [country, selectedCountryData, setSpeedLimit]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">E-bike Parameters</h2>
        <p className="text-muted-foreground">Define your e-bike application requirements</p>
      </div>

      {/* Regulation Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Regulation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select your target market to automatically set compliance requirements
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Country Selection */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-3">
              <Globe className="w-4 h-4 inline mr-2" />
              Target Country / Region
            </label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countryRegulations.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <div className="flex items-center justify-between w-full">
                      <span>{c.name}</span>
                      <span className="text-xs text-muted-foreground ml-4">
                        {c.speedLimit} km/h / {c.powerLimit}W
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Regulation Info Display */}
          {selectedCountryData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
              <div className="text-center p-3 bg-card rounded-lg border">
                <Gauge className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{selectedCountryData.speedLimit} km/h</p>
                <p className="text-xs text-muted-foreground">Speed Limit</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg border">
                <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{selectedCountryData.powerLimit} W</p>
                <p className="text-xs text-muted-foreground">Power Limit</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg border">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="flex flex-wrap gap-1 justify-center">
                  {selectedCountryData.standards.length > 0 ? (
                    selectedCountryData.standards.map((std) => (
                      <Badge key={std} variant="secondary" className="text-xs">
                        {std}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No specific standard</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Standards</p>
              </div>
            </div>
          )}
          
          {selectedCountryData?.notes && (
            <p className="text-xs text-muted-foreground bg-amber-500/10 p-2 rounded border border-amber-500/20">
              Note: {selectedCountryData.notes}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bike Type Selection */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-4">Bike Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(bikeTypeInfo) as BikeType[]).map((type) => (
            <Card
              key={type}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg",
                bikeType === type && "border-primary ring-2 ring-primary/20 bg-primary/5"
              )}
              onClick={() => setBikeType(type)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-secondary flex items-center justify-center border border-border">
                  <div className={cn("transition-colors", bikeType === type && "text-primary")}>
                    {bikeTypeIcons[type]}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{bikeTypeInfo[type].name}</h3>
                <p className="text-xs text-muted-foreground">{bikeTypeInfo[type].description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tire Type Selection */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-4">Tire Type</label>
        <div className="flex gap-4">
          <Card
            className={cn(
              "cursor-pointer transition-all duration-200 hover:border-primary/50 flex-1",
              tireType === "standard" && "border-primary ring-2 ring-primary/20 bg-primary/5"
            )}
            onClick={() => setTireType("standard")}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center border border-border">
                <div className="w-8 h-8 rounded-full border-4 border-current" />
              </div>
              <h4 className="font-semibold text-foreground">Standard Width</h4>
              <p className="text-xs text-muted-foreground">Regular tires for roads and light trails</p>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all duration-200 hover:border-primary/50 flex-1",
              tireType === "fat" && "border-primary ring-2 ring-primary/20 bg-primary/5"
            )}
            onClick={() => setTireType("fat")}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center border border-border">
                <div className="w-10 h-10 rounded-full border-4 border-current" />
              </div>
              <h4 className="font-semibold text-foreground">Fat Tire</h4>
              <p className="text-xs text-muted-foreground">Wide tires for sand, snow, rough terrain</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="space-y-6 bg-card rounded-lg p-6 border border-border">
        {/* Payload Capacity Slider */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-4">
            Payload Capacity: <span className="text-primary font-bold">{payload} kg</span>
          </label>
          <div className="px-2">
            <Slider
              value={[payload]}
              onValueChange={(value) => setPayload(value[0])}
              min={0}
              max={300}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0 kg</span>
              <span>150 kg</span>
              <span>300 kg</span>
            </div>
          </div>
        </div>

        {/* Riding Style */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-4">Riding Style Preference</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(ridingStyleInfo) as RidingStyle[]).map((style) => (
              <Card
                key={style}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:border-primary/50",
                  ridingStyle === style && "border-primary ring-2 ring-primary/20 bg-primary/5"
                )}
                onClick={() => setRidingStyle(style)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-lg bg-secondary",
                    ridingStyle === style && "bg-primary/20 text-primary"
                  )}>
                    {ridingStyleIcons[style]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{ridingStyleInfo[style].name}</h4>
                    <p className="text-xs text-muted-foreground">{ridingStyleInfo[style].description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" disabled={!bikeType} onClick={nextStep} className="px-8">
          Next: Select Motor
        </Button>
      </div>
    </div>
  );
}
