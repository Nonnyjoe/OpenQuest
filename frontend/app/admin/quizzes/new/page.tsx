"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clock, Timer, Plus, Loader2, Trash2 } from "lucide-react";
//import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionList } from "@/components/quiz/question-list";
import { Checkbox } from "@/components/ui/checkbox";
import { QuizPreview } from "@/components/quiz/quiz-preview";
import { QuizImportExport } from "@/components/quiz/quiz-import-export";
import { QuestionType } from "@/types/quiz";
import { PublishQuizButton } from "@/components/quiz/publish-quiz-button";
import { quizService, CreateQuizDto } from "@/services/quiz-service";
import { protocolService } from "@/services/protocol-service";
import { useRouter, useSearchParams } from "next/navigation";

export type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  points: number;
  correctAnswer?: string;
  explanation?: string;
};

const questionSchema = z.object({
  id: z.number(),
  question_text: z.string().min(1, "Question text is required"),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
        option_index: z.enum(["A", "B", "C", "D"]),
      })
    )
    .length(4, "Must have exactly 4 options"),
  correct_answer: z.enum(["A", "B", "C", "D"]),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  description: z.string().min(1, "Description is required"),
  access: z.enum(["Public", "Private"]),
  total_reward: z.number().min(0),
  max_reward_per_user: z.number().min(0),
  duration_in_sec_timestamp: z.number().min(1),
  start_time: z.number(),
  reward_type: z.enum(["distributed_by_rank", "fixed"]),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

const convertToFormQuestion = (question: Question) => ({
  id: Number(question.id),
  question_text: question.text,
  options: question.options.map((opt, index) => ({
    text: opt.text,
    option_index: ["A", "B", "C", "D"][index] as "A" | "B" | "C" | "D",
  })),
  correct_answer: question.options.findIndex(
    (opt) => opt.isCorrect
  ) as unknown as "A" | "B" | "C" | "D",
});

const convertToComponentQuestion = (formQuestion: any): Question => ({
  id: String(formQuestion.id),
  type: QuestionType.MULTIPLE_CHOICE,
  text: formQuestion.question_text,
  options: formQuestion.options.map((opt: any) => ({
    id: crypto.randomUUID(),
    text: opt.text,
    isCorrect: opt.option_index === formQuestion.correct_answer,
  })),
  points: 1,
});

export default function NewQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const protocolId = searchParams.get("protocolId");
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [quizCreated, setQuizCreated] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      difficulty: "Easy",
      description: "",
      access: "Public",
      total_reward: 0,
      max_reward_per_user: 0,
      duration_in_sec_timestamp: 3600,
      start_time: Math.floor(Date.now() / 1000),
      reward_type: "distributed_by_rank",
      questions: [
        {
          id: 1,
          question_text: "",
          options: [
            { text: "", option_index: "A" },
            { text: "", option_index: "B" },
            { text: "", option_index: "C" },
            { text: "", option_index: "D" },
          ],
          correct_answer: "A",
        },
      ],
    },
  });

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

  const removeQuestion = (index: number) => {
    const currentQuestions = form.getValues("questions");
    form.setValue(
      "questions",
      currentQuestions.filter((_, i) => i !== index)
    );
  };

  const handleFieldChange = async (field: string, value: any) => {
    setIsSaving(true);
    try {
      form.setValue(field as keyof z.infer<typeof formSchema>, value);
      // Could add auto-save functionality here
    } finally {
      setIsSaving(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!protocolId) {
      toast({
        title: "Error",
        description: "Protocol ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedData = {
        ...values,
        protocol: protocolId,
        questions: values.questions.map((q) => ({
          ...q,
          id: Number(q.id),
          question_text: q.question_text,
          options: q.options.map((opt, idx) => ({
            text: opt.text,
            option_index: ["A", "B", "C", "D"][idx],
          })),
          correct_answer: q.correct_answer,
        })),
      };

      console.log("Submitting quiz:", formattedData);
      await quizService.createQuiz(formattedData as CreateQuizDto);

      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
    } catch (error) {
      console.error("Failed to create quiz:", error);
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePublish = async () => {
    try {
      await quizService.publishQuiz({ quizId: createdQuizId });
      toast({
        title: "Quiz Published",
        description: "Your quiz is now available to participants.",
      });
      return Promise.resolve();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to publish quiz",
        variant: "destructive",
      });
      return Promise.reject();
    }
  };

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Quiz</h1>
          <p className="text-muted-foreground">
            Set up a new quiz with questions, timing, and rewards.
          </p>
        </div>

        {quizCreated ? (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Created Successfully</CardTitle>
              <CardDescription>
                Your quiz is ready to be published and shared with participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <PublishQuizButton
                  quizId={createdQuizId}
                  quizTitle={form.getValues("name")}
                  isPublished={false}
                  onPublish={handlePublish}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <TabsContent value="basic">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Set the main details of your quiz
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Quiz Name
                              {isSaving && (
                                <Loader2 className="ml-2 h-3 w-3 animate-spin inline" />
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter quiz name"
                                {...field}
                                disabled={isSubmitting}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleFieldChange("name", e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Give your quiz a clear and descriptive name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this quiz is about..."
                                className="h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Explain the purpose and content of the quiz
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty Level</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Easy">Easy</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose the skill level required
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="total_reward"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Reward</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="e.g. 1000"
                                    {...field}
                                    className="pl-16"
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    USDC
                                  </span>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Set the total reward for completing the quiz
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="questions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quiz Questions</CardTitle>
                      <CardDescription>
                        Add and manage your quiz questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex justify-between">
                        <QuizImportExport
                          questions={form
                            .getValues("questions")
                            .map(convertToComponentQuestion)}
                          onImport={(questions) =>
                            form.setValue(
                              "questions",
                              questions.map(convertToFormQuestion)
                            )
                          }
                        />
                        <QuizPreview
                          questions={form
                            .getValues("questions")
                            .map(convertToComponentQuestion)}
                          settings={{
                            duration_in_sec_timestamp: form.getValues(
                              "duration_in_sec_timestamp"
                            ),
                            totalPoints: form.getValues("questions").length,
                            passingScore: 0,
                          }}
                        />
                      </div>
                      <QuestionList />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quiz Settings</CardTitle>
                      <CardDescription>
                        Configure timing and scoring settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="max_reward_per_user"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Reward Per User</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Set the maximum reward for each participant
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="duration_in_sec_timestamp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
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

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="reward_type"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select reward type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="distributed_by_rank">
                                      Distributed by Rank
                                    </SelectItem>
                                    <SelectItem value="fixed">
                                      Fixed Reward
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <div>
                                <FormLabel>Reward Type</FormLabel>
                                <FormDescription>
                                  Choose how rewards are distributed
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const currentTab = activeTab;
                      if (currentTab === "basic") return;
                      if (currentTab === "questions") setActiveTab("basic");
                      if (currentTab === "settings") setActiveTab("questions");
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const currentTab = activeTab;
                      if (currentTab === "settings") return;
                      if (currentTab === "basic") setActiveTab("questions");
                      if (currentTab === "questions") setActiveTab("settings");
                    }}
                  >
                    Next
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isSubmitting || isSaving}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Quiz...
                    </>
                  ) : isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Create Quiz"
                  )}
                </Button>
              </form>
            </Form>
          </Tabs>
        )}
      </div>
    </div>
  );
}
