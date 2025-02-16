"use client";

import { Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Criterion {
  name: string;
  description: string;
  weight: number;
}

interface JudgingCriteriaProps {
  criteria: Criterion[];
}

export function JudgingCriteria({ criteria }: JudgingCriteriaProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <CardTitle>Judging Criteria</CardTitle>
        </div>
        <CardDescription>
          Projects will be evaluated based on the following criteria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {criteria.map((criterion, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{criterion.name}</h4>
              <span className="text-sm text-muted-foreground">
                {criterion.weight}%
              </span>
            </div>
            <Progress value={criterion.weight} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {criterion.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
