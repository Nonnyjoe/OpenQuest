// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Question, QuestionType } from "@/types/quiz";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuizResult {
  score: number;
  totalPoints: number;
  percentageScore: number;
  timeTaken: string;
  answers: {
    questionId: string;
    isCorrect: boolean;
    points: number;
    userAnswer: string | string[];
    correctAnswer: string | string[];
  }[];
}

export default function QuizResultsPage() {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quiz, setQuiz] = useState<{
    title: string;
    description: string;
    questions: Question[];
    passingScore: number;
  } | null>(null);

  useEffect(() => {
    // TODO: Fetch actual quiz and results data
    // Mock data for now
    setQuiz({
      title: "Sample Quiz",
      description: "Test your knowledge",
      questions: [],
      passingScore: 70,
    });

    setResult({
      score: 80,
      totalPoints: 100,
      percentageScore: 80,
      timeTaken: "15:30",
      answers: [],
    });
  }, []);

  if (!result || !quiz) return null;

  const isPassed = result.percentageScore >= quiz.passingScore;

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* <div className="space-y-2">
          <h1 className="text-2xl font-bold">{quiz.title} Results</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div> */}

        <Card>
          <CardHeader>
            <CardTitle>Score Overview</CardTitle>
            {/* <CardDescription>
              Your performance summary
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 rounded-lg bg-muted p-6 text-center">
              {/* <div className="space-y-1">
                <p className="text-4xl font-bold">
                  {result.score}/{result.totalPoints}
                </p>
                <p className="text-sm text-muted-foreground">Points Scored</p>
              </div> */}
              {/* <Progress
                value={result.percentageScore}
                className="h-3 w-44"
                indicatorClassName={cn(
                  isPassed
                    ? "bg-green-600 dark:bg-green-400"
                    : "bg-red-600 dark:bg-red-400"
                )}
              />
              <Badge
                variant={isPassed ? "default" : "destructive"}
                className="text-sm"
              >
                {isPassed ? "PASSED" : "FAILED"}
              </Badge> */}
              <p className="text-4xl font-bold"> Quiz recorded successfully</p>
              <p>Result will be made available at the end of Quiz</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* <div className="space-y-1">
                <p className="text-sm font-medium">Percentage Score</p>
                <p className="text-2xl font-bold">{result.percentageScore}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Passing Score</p>
                <p className="text-2xl font-bold">{quiz.passingScore}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Time Taken</p>
                <p className="text-2xl font-bold">{result.timeTaken}</p>
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* <div className="space-y-4">
          <h2 className="text-xl font-semibold">Detailed Breakdown</h2>
          {quiz.questions.map((question, index) => (
            <QuestionResult
              key={question.id}
              question={question}
              result={result.answers.find((a) => a.questionId === question.id)}
              number={index + 1}
            />
          ))}
        </div> */}

        {/* <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href={`/quizzes/${params.id}`}>Retake Quiz</Link>
          </Button>
          <Button asChild>
            <Link href="/quizzes">Back to Quizzes</Link>
          </Button>
        </div> */}
      </div>
    </div>
  );
}

function QuestionResult({
  question,
  result,
  number,
}: {
  question: Question;
  result?: QuizResult["answers"][0];
  number: number;
}) {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <span>Question {number}</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-normal text-muted-foreground">
                {result.points} points
              </span>
              {result.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardTitle>
          <CardDescription className="text-base font-medium">
            {question.text}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Your Answer:
            </p>
            <div className="rounded-lg border p-3">
              {formatAnswer(question, result.userAnswer)}
            </div>
          </div>
          {!result.isCorrect && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Correct Answer:
              </p>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-900/20">
                {formatAnswer(question, result.correctAnswer)}
              </div>
            </div>
          )}
          {question.explanation && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Explanation:
              </p>
              <div className="rounded-lg bg-muted p-3">
                {question.explanation}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatAnswer(question: Question, answer: string | string[]) {
  switch (question.type) {
    case QuestionType.MULTIPLE_CHOICE:
      return (
        <ul className="list-inside list-disc space-y-1">
          {(answer as string[]).map((optionId) => (
            <li key={optionId}>
              {question.options.find((o) => o.id === optionId)?.text}
            </li>
          ))}
        </ul>
      );
    case QuestionType.SINGLE_CHOICE:
    case QuestionType.TRUE_FALSE:
      return question.options.find((o) => o.id === answer)?.text;
    default:
      return answer;
  }
}
