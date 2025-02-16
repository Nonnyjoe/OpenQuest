"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Timer, AlertCircle } from "lucide-react";
import { Question, QuestionType } from "@/types/quiz";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { QuizProgress } from "@/components/quiz/quiz-progress";
import { QuestionInput } from "@/components/quiz/question-input";
import { QuizIntro } from "@/components/quiz/quiz-intro";
import { quizService } from "@/services/quiz-service";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizAnswer {
  questionId: string;
  answer: string | string[];
}

export default function QuizPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const quizId = params?.id as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60); // 30 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId) return;

    async function fetchQuiz() {
      try {
        const data = await quizService.getQuizById(quizId);
        setQuiz(data);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (answer: string | string[]) => {
    const currentQuestion = quiz.questions[currentQuestionIndex as number];
    setAnswers((prev) => {
      const existing = prev.findIndex(
        (a) => a.questionId === currentQuestion.id
      );
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { questionId: currentQuestion.id, answer };
        return updated;
      }
      return [...prev, { questionId: currentQuestion.id, answer }];
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement submission logic
      toast({
        title: "Quiz Submitted",
        description: "Your answers have been recorded.",
      });
      router.push(`/quizzes/${params.id}/results`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's Up!",
      description: "Your quiz will be automatically submitted.",
      variant: "destructive",
    });
    handleSubmit();
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
          <p className="text-muted-foreground">
            The quiz you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="container py-10">
        <QuizIntro
          title={quiz.name}
          description={quiz.description}
          duration={quiz.duration_in_sec_timestamp}
          totalQuestions={quiz.questions?.length || 0}
          difficulty={quiz.difficulty}
          reward={quiz.total_reward}
          onStart={handleStart}
        />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quiz.name}</h1>
            <p className="text-muted-foreground">{quiz.description}</p>
          </div>
          {currentQuestionIndex !== null && (
            <QuizTimer duration={timeRemaining} onTimeUp={handleTimeUp} />
          )}
        </div>

        {currentQuestionIndex !== null && (
          <QuizProgress
            currentQuestion={answers.length}
            totalQuestions={quiz.questions.length}
          />
        )}

        <AnimatePresence mode="wait">
          {currentQuestionIndex !== null && (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>Question {currentQuestionIndex + 1}</span>
                    <span className="text-muted-foreground">
                      {quiz.questions[currentQuestionIndex]?.points || 0} points
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-medium">
                    {quiz.questions[currentQuestionIndex]?.text}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuestionInput
                    question={quiz.questions[currentQuestionIndex] as Question}
                    value={
                      answers.find(
                        (a) =>
                          a.questionId ===
                          quiz.questions[currentQuestionIndex]?.id
                      )?.answer
                    }
                    onChange={handleAnswer}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex((i) => (i ?? 0) - 1)}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        setCurrentQuestionIndex((i) => (i ?? 0) + 1)
                      }
                    >
                      Next
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
