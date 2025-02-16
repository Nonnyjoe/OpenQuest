"use client";

import { Question, QuestionType } from "@/types/quiz";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuestionInputProps {
  question: Question;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
}

export function QuestionInput({
  question,
  value,
  onChange,
  disabled = false,
}: QuestionInputProps) {
  if (!question) return null;

  switch (question.type) {
    case QuestionType.SINGLE_CHOICE:
    case QuestionType.TRUE_FALSE:
      return (
        <RadioGroup
          value={value as string}
          onValueChange={onChange}
          disabled={disabled}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div
              key={option.id}
              className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <Label
                htmlFor={option.id}
                className="flex-grow cursor-pointer font-normal"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case QuestionType.MULTIPLE_CHOICE:
      return (
        <div className="space-y-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <Checkbox
                id={option.id}
                checked={((value as string[]) || []).includes(option.id)}
                onCheckedChange={(checked) => {
                  const currentValue = (value as string[]) || [];
                  if (checked) {
                    onChange([...currentValue, option.id]);
                  } else {
                    onChange(currentValue.filter((v) => v !== option.id));
                  }
                }}
                disabled={disabled}
              />
              <Label
                htmlFor={option.id}
                className="flex-grow cursor-pointer font-normal"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </div>
      );

    case QuestionType.SHORT_ANSWER:
    case QuestionType.FILL_BLANK:
      return (
        <div className="space-y-3">
          <Input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            disabled={disabled}
            className="max-w-xl"
          />
          {question.type === QuestionType.FILL_BLANK && (
            <p className="text-sm text-muted-foreground">
              Fill in the blank with the correct answer
            </p>
          )}
        </div>
      );

    default:
      return (
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          Unsupported question type
        </div>
      );
  }
}
