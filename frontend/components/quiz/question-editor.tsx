"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, GripVertical, Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { QuestionType } from "@/types/quiz";

interface QuestionEditorProps {
  index: number;
  onRemove: () => void;
}

export function QuestionEditor({ index, onRemove }: QuestionEditorProps) {
  const form = useFormContext();
  const questionType = form.watch(`questions.${index}.type`);
  const { fields, append, remove } = useFieldArray({
    name: `questions.${index}.options`,
    control: form.control,
  });

  const renderQuestionOptions = () => {
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.SINGLE_CHOICE:
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel>Options</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    id: crypto.randomUUID(),
                    text: "",
                    isCorrect: false,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
            {fields.map((field, optionIndex) => (
              <div key={field.id} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <FormField
                  control={form.control}
                  name={`questions.${index}.options.${optionIndex}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${optionIndex + 1}`}
                            {...field}
                          />
                          <FormField
                            control={form.control}
                            name={`questions.${index}.options.${optionIndex}.isCorrect`}
                            render={({ field: checkboxField }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    checked={checkboxField.value}
                                    onCheckedChange={(checked) => {
                                      if (
                                        questionType ===
                                        QuestionType.SINGLE_CHOICE
                                      ) {
                                        // Uncheck all other options
                                        fields.forEach((_, i) => {
                                          form.setValue(
                                            `questions.${index}.options.${i}.isCorrect`,
                                            i === optionIndex ? checked : false
                                          );
                                        });
                                      } else {
                                        checkboxField.onChange(checked);
                                      }
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(optionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        );

      case QuestionType.SHORT_ANSWER:
      case QuestionType.FILL_BLANK:
        return (
          <FormField
            control={form.control}
            name={`questions.${index}.correctAnswer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the correct answer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case QuestionType.TRUE_FALSE:
        return (
          <div className="space-y-2">
            <FormLabel>Correct Answer</FormLabel>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name={`questions.${index}.correctAnswer`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="radio"
                        checked={field.value === "true"}
                        onChange={() => field.onChange("true")}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">True</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`questions.${index}.correctAnswer`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="radio"
                        checked={field.value === "false"}
                        onChange={() => field.onChange("false")}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">False</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 rounded-lg border p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          <FormField
            control={form.control}
            name={`questions.${index}.question`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question {index + 1}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your question" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`questions.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="multiple_choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="fill_blank">
                      Fill in the Blank
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {renderQuestionOptions()}

          <FormField
            control={form.control}
            name={`questions.${index}.points`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Points awarded for correct answer
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </motion.div>
  );
}
