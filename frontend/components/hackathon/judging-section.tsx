"use client";

import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface JudgingSectionProps {
  form: UseFormReturn<any>;
}

export function JudgingSection({ form }: JudgingSectionProps) {
  const {
    fields: criteriaFields,
    append: appendCriteria,
    remove: removeCriteria,
  } = useFieldArray({
    control: form.control,
    name: "judgingCriteria",
  });

  const totalWeight = criteriaFields.reduce((sum, field) => {
    const weight = form.watch(`judgingCriteria.${field.id}.weight`) || 0;
    return sum + weight;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Judging Criteria & Schedule</CardTitle>
        <CardDescription>
          Define how projects will be evaluated and when judging takes place
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Judging Period */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="judgingPeriod.start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judging Start Date</FormLabel>
                <FormControl>
                  <ReactDatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormDescription>
                  When judges can start evaluating submissions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="judgingPeriod.end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judging End Date</FormLabel>
                <FormControl>
                  <ReactDatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormDescription>
                  Final deadline for submitting evaluations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Judging Criteria */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <FormLabel>Judging Criteria</FormLabel>
              <FormDescription>
                Total Weight: {totalWeight}%{" "}
                {totalWeight !== 100 && "(Must sum to 100%)"}
              </FormDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendCriteria({
                  id: crypto.randomUUID(),
                  title: "",
                  description: "",
                  weight: 0,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Criterion
            </Button>
          </div>

          <div className="space-y-4">
            {criteriaFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex items-start justify-between">
                      <div className="grid gap-4 flex-1">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`judgingCriteria.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Criterion Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Technical Innovation"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`judgingCriteria.${index}.weight`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weight (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`judgingCriteria.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe what judges should look for..."
                                  className="h-20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
