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
import { useWriteContract, useAccount } from "wagmi";
import { keccak256, toBytes } from "viem";
import { ProtocolABI } from "@/lib/abi";

interface QuizAnswer {
  questionId: string;
  answer: string | string[];
}

interface QuizQuestion {
  id: string;
  originalId: number;
  text: string;
  type: QuestionType;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  points: number;
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
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  useEffect(() => {
    console.log("Quiz page params:", params);
    console.log("Quiz ID from params:", quizId);
  }, [params, quizId]);

  useEffect(() => {
    if (!quizId) return;

    async function fetchQuiz() {
      try {
        setIsLoading(true);
        const response = await quizService.getQuizById(quizId);

        // Transform quiz data to match our UI needs
        const transformedQuiz = {
          id: response.uuid,
          name: response.name,
          description: response.description,
          duration_in_sec_timestamp: response.duration_in_sec_timestamp,
          difficulty: response.difficulty,
          total_reward: response.total_reward,
          questions:
            response.questions?.map((q: any, index: number) => ({
              id: String(index + 1),
              originalId: q.id,
              text: q.question_text,
              type: QuestionType.SINGLE_CHOICE,
              options: q.options.map((opt: any) => ({
                id: opt.option_index,
                text: opt.text,
                isCorrect: opt.option_index === q.correct_answer,
              })),
              points: 10,
            })) || [],
        };

        setQuiz(transformedQuiz);
        setTimeRemaining(transformedQuiz.duration_in_sec_timestamp);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load quiz. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId, toast]);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (answer: string | string[]) => {
    const currentQuestion = quiz.questions[currentQuestionIndex as number];

    setAnswers((prev) => {
      // Create new answer object
      const newAnswer = {
        questionId: currentQuestion.id,
        answer: Array.isArray(answer) ? answer[0] : answer,
      };

      // Find if this question was already answered
      const existingIndex = prev.findIndex(
        (a) => a.questionId === currentQuestion.id
      );

      let updated;
      if (existingIndex !== -1) {
        // Replace existing answer
        updated = [...prev];
        updated[existingIndex] = newAnswer;
      } else {
        // Add new answer
        updated = [...prev, newAnswer];
      }

      // Update progress
      const uniqueAnswered = new Set(updated.map((a) => a.questionId)).size;
      setProgress(uniqueAnswered);

      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      if (!isConnected) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to submit the quiz",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      // Format answers for submission
      const formattedAnswers = answers.map((answer) => {
        const question = quiz.questions.find(
          (q: QuizQuestion) => q.id === answer.questionId
        );
        return {
          question_id: Number(question?.originalId),
          answer: String(answer.answer).toUpperCase(),
        };
      });

      // Create submission object
      const submission = {
        quiz_id: quizId,
        answers: formattedAnswers,
      };

      // Hash the submission object
      const submissionHash = keccak256(toBytes(JSON.stringify(submission)));

      // Submit hash to smart contract
      await writeContract({
        address: "0xCd1a3b3FADffAcf76beA7B5C264515E91f996Cc1",
        abi: ProtocolABI,
        functionName: "submitQuiz",
        args: [submissionHash],
      });

      // Submit answers to backend
      await quizService.submitQuiz(quizId, formattedAnswers);

      toast({
        title: "Quiz Submitted",
        description: "Your answers have been submitted successfully",
      });

      router.push(`/quizzes/${quizId}/results`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          duration={Math.ceil(quiz.duration_in_sec_timestamp / 60)}
          totalQuestions={quiz.questions?.length || 0}
          difficulty={quiz.difficulty}
          reward={quiz.total_reward}
          onStart={handleStart}
          quizId={quiz.id}
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
            currentQuestion={progress}
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
