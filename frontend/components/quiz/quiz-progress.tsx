"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export function QuizProgress({
  currentQuestion,
  totalQuestions,
}: QuizProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Progress</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              progress === 100
                ? "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-400"
            )}
          >
            {currentQuestion} of {totalQuestions}
          </span>
        </div>
        <span className="text-muted-foreground">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <Progress
        value={progress}
        className="h-2"
        indicatorClassName={cn(
          progress === 100
            ? "bg-green-600 dark:bg-green-400"
            : "bg-blue-600 dark:bg-blue-400"
        )}
      />
    </div>
  );
}
