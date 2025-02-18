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
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import { useToast } from "@/components/ui/use-toast";
import { quizService } from "@/services/quiz-service";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

interface QuizIntroProps {
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  difficulty: string;
  reward: number;
  onStart: () => void;
  quizId: string;
}

export function QuizIntro({
  title,
  description,
  duration,
  totalQuestions,
  difficulty,
  reward,
  onStart,
  quizId,
}: QuizIntroProps) {
  const { isConnected } = useAccount();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    console.log("QuizIntro props:", {
      title,
      description,
      duration,
      totalQuestions,
      difficulty,
      reward,
      quizId,
    });
  }, [
    title,
    description,
    duration,
    totalQuestions,
    difficulty,
    reward,
    quizId,
  ]);

  const handleStartQuiz = async () => {
    try {
      setIsStarting(true);

      if (!quizId) {
        throw new Error("Quiz ID is required");
      }

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in before starting the quiz",
          variant: "destructive",
        });
        return;
      }

      await quizService.startQuiz(quizId);
      onStart();
    } catch (error) {
      console.error("Failed to start quiz:", error);
      toast({
        title: "Error",
        description:
          (error as any).response?.data ||
          "Failed to start quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
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
          {!isConnected ? (
            <div className="w-full space-y-4">
              <p className="text-center text-muted-foreground">
                Please connect your wallet to start the quiz
              </p>
              <WalletConnect />
            </div>
          ) : (
            <Button
              onClick={handleStartQuiz}
              className="w-full"
              disabled={isStarting}
            >
              {isStarting ? "Starting..." : "Start Quiz"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
