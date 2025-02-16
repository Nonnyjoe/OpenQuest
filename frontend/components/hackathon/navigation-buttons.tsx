"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface NavigationButtonsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  isLastStep?: boolean;
}

export function NavigationButtons({
  activeTab,
  setActiveTab,
  isLoading,
  isLastStep = false,
}: NavigationButtonsProps) {
  const tabs = ["basic", "prizes", "judging", "rules"];
  const currentIndex = tabs.indexOf(activeTab);
  const isFirstStep = currentIndex === 0;
  const isActualLastStep = currentIndex === tabs.length - 1;

  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button type="button" onClick={handleNext} disabled={isActualLastStep}>
          Next
        </Button>
      </div>

      {isLastStep && (
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Hackathon
        </Button>
      )}
    </div>
  );
}
