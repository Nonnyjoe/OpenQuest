"use client";

import { CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function HackathonProgress() {
  const milestones = [
    { title: "Registration", completed: true },
    { title: "Team Formation", completed: true },
    { title: "Project Development", completed: false },
    { title: "Submission", completed: false },
    { title: "Judging", completed: false },
  ];

  const completedSteps = milestones.filter((m) => m.completed).length;
  const progress = (completedSteps / milestones.length) * 100;

  return (
    <Card>
      <CardContent className="pt-6">
        <Progress value={progress} className="mb-4" />
        <div className="grid grid-cols-5 gap-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {milestone.completed ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <Clock className="h-5 w-5 text-muted-foreground" />
              )}
              <p className="mt-2 text-sm">{milestone.title}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
