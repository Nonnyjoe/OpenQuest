"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Timer } from "lucide-react";

interface QuizTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
}

export function QuizTimer({ duration, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getColor = () => {
    if (timeLeft <= 60) return "text-destructive"; // Last minute
    if (timeLeft <= 300) return "text-warning"; // Last 5 minutes
    return "text-primary";
  };

  return (
    <Card className="inline-flex items-center gap-2 px-4 py-2">
      <Timer className={getColor()} />
      <span className={`font-mono text-lg font-medium ${getColor()}`}>
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </span>
    </Card>
  );
}
