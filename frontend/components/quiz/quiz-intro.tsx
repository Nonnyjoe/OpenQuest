"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Timer, AlertCircle } from "lucide-react";

interface QuizIntroProps {
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  onStart: () => void;
}

export function QuizIntro({
  title,
  description,
  duration,
  totalQuestions,
  onStart,
}: QuizIntroProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Time Limit</p>
                  <p className="text-sm text-muted-foreground">
                    {duration} minutes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Questions</p>
                  <p className="text-sm text-muted-foreground">
                    {totalQuestions} questions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Instructions:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>The timer will start once you click "Start Quiz"</li>
              <li>
                You can navigate between questions using the buttons provided
              </li>
              <li>
                Your answers are saved automatically when you move between
                questions
              </li>
              <li>
                The quiz will be submitted automatically when the time limit is
                reached
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onStart} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
