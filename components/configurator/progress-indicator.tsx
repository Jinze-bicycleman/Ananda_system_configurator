"use client";

import { Check, ClipboardList, Cog, Package, GitBranch, LineChart, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/lib/configurator-store";

const steps = [
  { number: 1, label: "E-bike", icon: ClipboardList },
  { number: 2, label: "Motor", icon: Cog },
  { number: 3, label: "Components", icon: Package },
  { number: 4, label: "Diagram", icon: GitBranch },
  { number: 5, label: "Drivetrain", icon: LineChart },
  { number: 6, label: "Summary", icon: Save },
];

export function ProgressIndicator() {
  const { currentStep } = useConfigStore();

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isActive && "bg-primary border-primary text-primary-foreground scale-110",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    !isActive && !isCompleted && "bg-card border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium hidden sm:block",
                    isActive && "text-primary",
                    isCompleted && "text-foreground",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors duration-300",
                    step.number < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep} of 6
        </span>
      </div>
    </div>
  );
}
