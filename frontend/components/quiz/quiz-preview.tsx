"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Shuffle } from "lucide-react";
import {
  Question,
  QuestionOption,
  QuestionType,
  QuizSettings,
} from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface QuizPreviewProps {
  questions: Question[];
  settings: QuizSettings;
}

export function QuizPreview({ questions, settings }: QuizPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<
    Record<string, QuestionOption[]>
  >({});

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializePreview = () => {
    const orderedQuestions = [...questions];
    const questionOrder = settings.randomizeQuestions
      ? shuffleArray(orderedQuestions)
      : orderedQuestions;

    const optionOrder: Record<string, QuestionOption[]> = {};
    questionOrder.forEach((question) => {
      optionOrder[question.id] = settings.randomizeOptions
        ? shuffleArray(question.options)
        : question.options;
    });

    setShuffledQuestions(questionOrder);
    setShuffledOptions(optionOrder);
    setCurrentQuestionIndex(0);
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const renderQuestion = (question: Question) => {
    const options = shuffledOptions[question.id] || question.options;

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-4">
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox id={option.id} />
                <Label htmlFor={option.id}>{option.text}</Label>
              </div>
            ))}
          </div>
        );

      case QuestionType.SINGLE_CHOICE:
        return (
          <RadioGroup>
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "true_false":
        return (
          <RadioGroup>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false">False</Label>
            </div>
          </RadioGroup>
        );

      case "short_answer":
      case "fill_blank":
        return (
          <Input placeholder="Type your answer here..." className="max-w-md" />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            initializePreview();
            setIsOpen(true);
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            {(settings.randomizeQuestions || settings.randomizeOptions) && (
              <Badge variant="secondary">
                <Shuffle className="mr-1 h-3 w-3" />
                Randomized
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Preview how participants will see your quiz
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-1 w-full bg-secondary">
          <div
            className="absolute h-1 bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">{currentQuestion?.text}</h3>
            {currentQuestion && renderQuestion(currentQuestion)}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((i) => i - 1)}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentQuestionIndex === questions.length - 1) {
                  setIsOpen(false);
                } else {
                  setCurrentQuestionIndex((i) => i + 1);
                }
              }}
            >
              {currentQuestionIndex === questions.length - 1
                ? "Finish"
                : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
