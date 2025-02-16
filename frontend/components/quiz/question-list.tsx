"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionType } from "@/types/quiz";

export function QuestionList() {
  const form = useFormContext();
  const questions = form.watch("questions");

  const addQuestion = () => {
    const currentQuestions = form.getValues("questions");
    form.setValue("questions", [
      ...currentQuestions,
      {
        id: crypto.randomUUID(),
        type: QuestionType.MULTIPLE_CHOICE,
        text: "",
        options: [
          { id: crypto.randomUUID(), text: "", isCorrect: false },
          { id: crypto.randomUUID(), text: "", isCorrect: false },
        ],
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const currentQuestions = form.getValues("questions");
    form.setValue(
      "questions",
      currentQuestions.filter((_: any, i: number) => i !== index)
    );
  };

  const addOption = (questionIndex: number) => {
    const questions = form.getValues("questions");
    const question = questions[questionIndex];
    form.setValue(`questions.${questionIndex}.options`, [
      ...question.options,
      { id: crypto.randomUUID(), text: "", isCorrect: false },
    ]);
  };

  return (
    <div className="space-y-6">
      {questions.map((question: any, questionIndex: number) => (
        <Card key={question.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Question {questionIndex + 1}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeQuestion(questionIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={`questions.${questionIndex}.text`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`questions.${questionIndex}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={QuestionType.MULTIPLE_CHOICE}>
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value={QuestionType.SINGLE_CHOICE}>
                        Single Choice
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Options</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(questionIndex)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>

              {question.options.map((option: any, optionIndex: number) => (
                <div key={option.id} className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.options.${optionIndex}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Option text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            type={
                              question.type === QuestionType.MULTIPLE_CHOICE
                                ? "checkbox"
                                : "radio"
                            }
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            name={`question-${questionIndex}-correct`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" onClick={addQuestion} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    </div>
  );
}
