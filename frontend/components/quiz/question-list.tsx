"use client";

import { useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function QuestionList() {
  const form = useFormContext();
  const questions = form.watch("questions");

  const addQuestion = () => {
    const currentQuestions = form.getValues("questions");
    form.setValue("questions", [
      ...currentQuestions,
      {
        id: currentQuestions.length + 1,
        question_text: "",
        options: [
          { text: "", option_index: "A" },
          { text: "", option_index: "B" },
          { text: "", option_index: "C" },
          { text: "", option_index: "D" },
        ],
        correct_answer: "A",
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {questions.map((_: any, index: number) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Question {index + 1}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentQuestions = form.getValues("questions");
                form.setValue(
                  "questions",
                  currentQuestions.filter((_: any, i: number) => i !== index)
                );
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <FormField
            control={form.control}
            name={`questions.${index}.question_text`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Text</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your question" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            {["A", "B", "C", "D"].map((option) => (
              <FormField
                key={option}
                control={form.control}
                name={`questions.${index}.options.${
                  option === "A"
                    ? 0
                    : option === "B"
                    ? 1
                    : option === "C"
                    ? 2
                    : 3
                }.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option {option}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`Enter option ${option}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <FormField
            control={form.control}
            name={`questions.${index}.correct_answer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <FormControl>
                  <select {...field} className="w-full p-2 border rounded-md">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}

      <Button type="button" onClick={addQuestion} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    </div>
  );
}
