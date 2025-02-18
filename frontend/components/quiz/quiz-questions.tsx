"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { quizService } from "@/services/quiz-service";
import { useRouter } from "next/navigation";

interface QuizQuestionsProps {
  quizId: string;
  questions: {
    id: number;
    question_text: string;
    options: {
      text: string;
      option_index: string;
    }[];
  }[];
  onSubmit?: () => void;
}

export function QuizQuestions({
  quizId,
  questions,
  onSubmit,
}: QuizQuestionsProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => ({
          question_id: Number(questionId),
          answer,
        })
      );

      // Validate all questions are answered
      if (formattedAnswers.length !== questions.length) {
        toast({
          title: "Incomplete Quiz",
          description: "Please answer all questions before submitting",
          variant: "destructive",
        });
        return;
      }

      await quizService.submitQuiz(quizId, formattedAnswers);

      toast({
        title: "Quiz Submitted",
        description: "Your answers have been submitted successfully",
      });

      // Call onSubmit callback if provided
      onSubmit?.();

      // Redirect to results or dashboard
      router.push("/quizzes");
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

  return (
    <div className="space-y-8">
      {questions.map((question, index) => (
        <div key={question.id} className="space-y-4">
          <h3 className="font-medium">
            {index + 1}. {question.question_text}
          </h3>
          <div className="space-y-2">
            {question.options.map((option) => (
              <Button
                key={option.option_index}
                variant={
                  answers[question.id] === option.option_index
                    ? "default"
                    : "outline"
                }
                className="w-full justify-start"
                onClick={() =>
                  handleAnswerSelect(question.id, option.option_index)
                }
              >
                {option.option_index}. {option.text}
              </Button>
            ))}
          </div>
        </div>
      ))}

      <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Quiz"}
      </Button>
    </div>
  );
}
