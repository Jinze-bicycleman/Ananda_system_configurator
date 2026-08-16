"use client";

import { useConfigStore } from "@/lib/configurator-store";
import { ProgressIndicator } from "./progress-indicator";
import { Step1Requirements } from "./step-1-requirements";
import { Step2Motor } from "./step-2-motor";
import { Step3Components } from "./step-3-components";
import { Step4Diagram } from "./step-4-diagram";
import { Step5Drivetrain } from "./step-5-drivetrain";
import { Step6Summary } from "./step-6-summary";

export function Configurator() {
  const { currentStep } = useConfigStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Requirements />;
      case 2:
        return <Step2Motor />;
      case 3:
        return <Step3Components />;
      case 4:
        return <Step4Diagram />;
      case 5:
        return <Step5Drivetrain />;
      case 6:
        return <Step6Summary />;
      default:
        return <Step1Requirements />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  E-Bike Powertrain Configurator
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  7000 Series - Premium Performance Systems
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of 6
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto">
          <ProgressIndicator />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStep()}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>E-Bike Motor Company - Premium Powertrain Solutions</p>
            <p>All specifications subject to change.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
