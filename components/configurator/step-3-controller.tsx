"use client";

import { Check, Cpu, Zap, DollarSign, Wifi, Info, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/lib/configurator-store";
import { controllers, type Controller } from "@/lib/product-data";

export function Step3Controller() {
  const { selectedMotor, selectedController, setController, nextStep, prevStep } = useConfigStore();

  // If motor has integrated controller, show skip message
  if (selectedMotor && !selectedMotor.controllerRequired) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Controller Selection</h2>
          <p className="text-muted-foreground">External controller configuration</p>
        </div>

        <Alert className="bg-primary/10 border-primary/30">
          <Info className="h-5 w-5 text-primary" />
          <AlertDescription className="text-foreground ml-2">
            <strong>This motor has an integrated controller.</strong>
            <br />
            The {selectedMotor.model} comes with a built-in controller, so no external controller
            is needed. This simplifies installation and reduces overall system weight.
          </AlertDescription>
        </Alert>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/20">
              <Cpu className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Integrated Controller</h3>
              <p className="text-muted-foreground">
                Built into the motor - no additional purchase required
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="secondary" size="lg" onClick={prevStep}>
            Back
          </Button>
          <Button size="lg" onClick={nextStep} className="px-8">
            Continue to Battery Selection
          </Button>
        </div>
      </div>
    );
  }

  // Filter compatible controllers
  const filteredControllers = controllers.filter(
    (controller) => selectedMotor && controller.compatibleMotors.includes(selectedMotor.model)
  );

  const handleSelect = (controller: Controller) => {
    setController(controller);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Controller</h2>
        <p className="text-muted-foreground">
          Choose a controller compatible with {selectedMotor?.model}
        </p>
      </div>

      {filteredControllers.length === 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            No compatible controllers found for the selected motor. Please go back and select a
            different motor.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredControllers.map((controller) => (
            <Card
              key={controller.model}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg relative",
                selectedController?.model === controller.model &&
                  "border-primary ring-2 ring-primary/20 bg-primary/5"
              )}
              onClick={() => handleSelect(controller)}
            >
              {selectedController?.model === controller.model && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <CardContent className="p-5">
                {/* Image Placeholder */}
                <div className="w-full h-32 mb-4 rounded-lg bg-secondary flex items-center justify-center border border-border">
                  {controller.image ? (
                    <img src={controller.image} alt={controller.model} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-bold text-lg text-foreground">{controller.model}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Continuous Current:</span>
                    <span className="text-foreground font-medium">
                      {controller.continuousCurrent}A
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Voltage:</span>
                    <span className="text-foreground font-medium">{controller.voltage}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wifi className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Protocol:</span>
                    <span className="text-foreground font-medium">{controller.protocol}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{controller.price}</span>
                  </div>
                  <Button
                    variant={selectedController?.model === controller.model ? "default" : "secondary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(controller);
                    }}
                  >
                    {selectedController?.model === controller.model ? "Selected" : "Select"}
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
          disabled={!selectedController && filteredControllers.length > 0}
          onClick={nextStep}
          className="px-8"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
