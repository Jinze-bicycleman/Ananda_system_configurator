"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useConfigStore } from "@/lib/configurator-store";
import { calculateDrivetrain, chainrings } from "@/lib/product-data";
import { Settings, TrendingUp, Gauge, Zap, Link, CircleDashed } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const rearSprockets = [11, 13, 15, 17, 19, 21, 24, 28, 32, 34];
const chainringSizes = [38, 42, 46];

export function Step5Drivetrain() {
  const {
    selectedMotor,
    selectedChainring,
    speedLimit,
    payload,
    driveType,
    minSpeed,
    maxSpeed,
    cadence,
    slope,
    rearSprocket,
    setDriveType,
    setMinSpeed,
    setMaxSpeed,
    setCadence,
    setSlope,
    setRearSprocket,
    nextStep,
    prevStep,
  } = useConfigStore();

  const chainringTeeth = selectedChainring?.teeth || 42;

  const isHubMotor = selectedMotor?.motorType === "hub";

  // Chart 1: Wheel Torque vs Gear Ratio for different slopes
  const torqueChartData = useMemo(() => {
    if (!selectedMotor) return null;
    
    const gearRatios = Array.from({ length: 15 }, (_, i) => 1.5 + i * 0.2);
    const slopes = [0, 5, 10];
    
    const datasets = slopes.map((slopeVal, idx) => {
      const colors = ["rgba(99, 179, 237, 1)", "rgba(251, 191, 36, 1)", "rgba(239, 68, 68, 1)"];
      const bgColors = ["rgba(99, 179, 237, 0.1)", "rgba(251, 191, 36, 0.1)", "rgba(239, 68, 68, 0.1)"];
      
      return {
        label: `${slopeVal}% slope`,
        data: gearRatios.map((ratio) => {
          // Hub motors: torque is constant (not multiplied by gear ratio)
          // Mid-drive: torque multiplies by gear ratio
          const baseTorque = isHubMotor ? selectedMotor.torque : selectedMotor.torque * ratio;
          const slopeFactor = 1 - slopeVal * 0.015;
          return Math.round(baseTorque * slopeFactor);
        }),
        borderColor: colors[idx],
        backgroundColor: bgColors[idx],
        tension: 0.4,
        fill: false,
      };
    });

    return {
      labels: gearRatios.map((r) => r.toFixed(1)),
      datasets,
    };
  }, [selectedMotor, isHubMotor]);

  // Chart 2: Cadence vs Speed for different chainring sizes
  const cadenceChartData = useMemo(() => {
    const wheelCircumference = 2.1; // meters for 27.5" wheel
    const speeds = Array.from({ length: 10 }, (_, i) => 5 + i * 5);
    
    const datasets = chainringSizes.map((chainringSize, idx) => {
      const colors = ["rgba(99, 179, 237, 1)", "rgba(34, 197, 94, 1)", "rgba(251, 191, 36, 1)"];
      const gearRatio = chainringSize / rearSprocket;
      
      return {
        label: `${chainringSize}T chainring`,
        data: speeds.map((speed) => {
          const wheelRPM = (speed * 1000) / (wheelCircumference * 60);
          const cadenceVal = wheelRPM / gearRatio;
          return Math.round(cadenceVal);
        }),
        borderColor: colors[idx],
        backgroundColor: "transparent",
        tension: 0.4,
        borderWidth: chainringTeeth === chainringSize ? 3 : 1.5,
        borderDash: chainringTeeth === chainringSize ? [] : [5, 5],
      };
    });

    return {
      labels: speeds.map((s) => `${s}`),
      datasets,
    };
  }, [chainringTeeth, rearSprocket]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(0, 0, 0, 0.8)",
          font: { size: 11 },
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "rgba(0, 0, 0, 0.9)",
        bodyColor: "rgba(0, 0, 0, 0.7)",
        borderColor: "rgba(0, 0, 0, 0.2)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "rgba(0, 0, 0, 0.7)" },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "rgba(0, 0, 0, 0.7)" },
      },
    },
  };

  // Calculate recommendations
  const recommendations = useMemo(() => {
    if (!selectedMotor) return null;

    const result = calculateDrivetrain({
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

    return result;
  }, [selectedMotor, chainringTeeth, rearSprocket, payload, isHubMotor]);

  if (!selectedMotor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please select a motor first.</p>
        <Button onClick={prevStep} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-foreground mb-2">Drivetrain Analysis</h2>
        <p className="text-muted-foreground">
          Configure your drivetrain parameters and view performance calculations
        </p>
      </div>

      {/* Hub Motor Note */}
      {isHubMotor && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Hub Motor Note:</span> Gear ratio affects pedal cadence only. 
            Motor torque is applied directly to the wheel and does not multiply with gear ratio.
          </p>
        </div>
      )}

      {/* Drive Type Selector - Prominent Center Banner */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <CardContent className="py-8">
          <h3 className="text-lg font-semibold text-center text-foreground mb-6">Choose Your Drive System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Chain Drive Option */}
            <div
              onClick={() => setDriveType("chain")}
              className={`relative cursor-pointer rounded-xl p-6 transition-all duration-200 border-2 ${
                driveType === "chain"
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              }`}
            >
              {driveType === "chain" && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  driveType === "chain" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  <Link className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-foreground">Chain Drive</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                High efficiency and easy maintenance with widely available replacement parts. Requires regular lubrication and cleaning.
              </p>
            </div>

            {/* Belt Drive Option */}
            <div
              onClick={() => setDriveType("belt")}
              className={`relative cursor-pointer rounded-xl p-6 transition-all duration-200 border-2 ${
                driveType === "belt"
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              }`}
            >
              {driveType === "belt" && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  driveType === "belt" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  <CircleDashed className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-foreground">Belt Drive</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Silent, clean, and maintenance-free operation with longer lifespan. Requires a split frame design.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Parameters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-5 h-5 text-primary" />
            Riding Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Expected Speed Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">
                Expected Speed Range: {minSpeed} - {maxSpeed} km/h
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={minSpeed}
                    onChange={(e) => setMinSpeed(Number(e.target.value))}
                    min={5}
                    max={maxSpeed - 5}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">Min</span>
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    value={maxSpeed}
                    onChange={(e) => setMaxSpeed(Number(e.target.value))}
                    min={minSpeed + 5}
                    max={speedLimit}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">Max</span>
                </div>
              </div>
              <div className="p-2 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Tip:</span> Normal city commute averages around 18 km/h
                </p>
              </div>
            </div>

            {/* Preferred Cadence */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">
                Preferred Cadence: {cadence} RPM
              </label>
              <Slider
                value={[cadence]}
                onValueChange={(v) => setCadence(v[0])}
                min={40}
                max={110}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>40 RPM</span>
                <span>110 RPM</span>
              </div>
              <div className="p-2 bg-secondary rounded-lg space-y-1">
                <p className="text-xs font-medium text-foreground">Sweet Spot by Riding Style:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>City commute: 50-70 RPM</li>
                  <li>Hilly terrain: 60-80 RPM</li>
                  <li>Sport riding: 80-90 RPM</li>
                </ul>
              </div>
            </div>

            {/* Typical Slope */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">
                Typical Slope: {slope}%
              </label>
              <Slider
                value={[slope]}
                onValueChange={(v) => setSlope(v[0])}
                min={0}
                max={15}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Flat</span>
                <span>15% grade</span>
              </div>
              <div className="p-2 bg-secondary rounded-lg space-y-1">
                <p className="text-xs font-medium text-foreground">Typical Terrain Examples:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>0-2%: Flat cities (e.g., Dutch cities)</li>
                  <li>3-6%: Moderate hills</li>
                  <li>7-15%: Mountain roads</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-primary" />
              Wheel Torque vs Gear Ratio
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Torque output at different gear ratios and slope conditions
            </p>
            {isHubMotor && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                Hub motor: 1:1 torque ratio (motor torque = wheel torque, gear ratio only affects pedal cadence)
              </p>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px]">
              {torqueChartData && (
                <Line
                  data={torqueChartData}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      x: {
                        ...chartOptions.scales.x,
                        title: { display: true, text: "Gear Ratio", color: "rgba(0, 0, 0, 0.7)" },
                      },
                      y: {
                        ...chartOptions.scales.y,
                        title: { display: true, text: "Wheel Torque (Nm)", color: "rgba(0, 0, 0, 0.7)" },
                      },
                    },
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="w-5 h-5 text-primary" />
              Cadence vs Speed
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Comfortable cadence zone: 75-95 RPM
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px]">
              {cadenceChartData && (
                <Line
                  data={cadenceChartData}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      x: {
                        ...chartOptions.scales.x,
                        title: { display: true, text: "Speed (km/h)", color: "rgba(0, 0, 0, 0.7)" },
                      },
                      y: {
                        ...chartOptions.scales.y,
                        title: { display: true, text: "Cadence (RPM)", color: "rgba(0, 0, 0, 0.7)" },
                        min: 0,
                        max: 150,
                      },
                    },
                  }}
                />
              )}
            </div>
            <div className="mt-3 p-3 bg-primary/10 rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/30 border border-green-500/50 rounded" />
              <p className="text-xs text-muted-foreground">
                Comfortable cadence zone: 75-95 RPM
              </p>
            </div>
            
            {/* Rear Sprocket Selection - Under Cadence Chart for better visibility */}
            <div className="mt-4 pt-4 border-t border-border">
              <label className="text-sm font-medium text-foreground block mb-3">
                Rear Sprocket: {rearSprocket}T
              </label>
              <div className="flex flex-wrap gap-2">
                {rearSprockets.map((teeth) => (
                  <Button
                    key={teeth}
                    size="sm"
                    variant={rearSprocket === teeth ? "default" : "secondary"}
                    onClick={() => setRearSprocket(teeth)}
                  >
                    {teeth}T
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Adjust to see how cadence changes at different speeds
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Drivetrain Recommendations
              <Badge variant="secondary">Calculated</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultCard
                label="Recommended Chainring"
                value={`${recommendations.recommendedChainring}T`}
                icon={<Settings className="w-5 h-5" />}
              />
              <ResultCard
                label="Rear Sprocket Range"
                value={recommendations.recommendedRearSprocket}
                icon={<Settings className="w-5 h-5" />}
              />
              <ResultCard
                label="Max Climbing Grade"
                value={`${recommendations.maxClimbGrade}%`}
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <ResultCard
                label="Theoretical Top Speed"
                value={`${recommendations.theoreticalTopSpeed} km/h`}
                icon={<Zap className="w-5 h-5" />}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-card rounded-lg border">
                <span className="text-muted-foreground">Current Gear Ratio:</span>
                <span className="ml-2 font-semibold text-foreground">{recommendations.gearRatio}</span>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <span className="text-muted-foreground">Wheel Torque:</span>
                <span className="ml-2 font-semibold text-foreground">{recommendations.wheelTorque} Nm</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button size="lg" onClick={nextStep} className="px-8">
          Next: Save & Compare
        </Button>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center p-4 bg-card rounded-lg border">
      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-xl text-primary">{value}</p>
    </div>
  );
}
