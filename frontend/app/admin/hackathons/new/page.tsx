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
import { Calendar, Plus, Loader2, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
//import { DateTimePicker } from "@/components/ui/date-time-picker";
import { ProjectTrack, HackathonStatus } from "@/types/hackathon";
import { BasicInfoSection } from "@/components/hackathon/basic-info-section";
import { PrizesAndTracksSection } from "@/components/hackathon/prizes-tracks-section";
import { JudgingSection } from "@/components/hackathon/judging-section";
import { RulesSection } from "@/components/hackathon/rules-section";
import { NavigationButtons } from "@/components/hackathon/navigation-buttons";

const hackathonFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(200, "Short description must not exceed 200 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  startDate: z.date().min(new Date(), "Start date must be in the future"),
  endDate: z.date(),
  registrationDeadline: z.date(),
  submissionDeadline: z.date(),
  judgingPeriod: z.object({
    start: z.date(),
    end: z.date(),
  }),
  tracks: z
    .array(z.nativeEnum(ProjectTrack))
    .min(1, "Select at least one track"),
  prizes: z
    .array(
      z.object({
        id: z.string(),
        track: z.nativeEnum(ProjectTrack),
        title: z.string().min(1, "Prize title is required"),
        description: z.string().min(1, "Prize description is required"),
        amount: z.number().min(0, "Prize amount must be positive"),
        sponsor: z.string().optional(),
      })
    )
    .min(1, "Add at least one prize"),
  judgingCriteria: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Criterion title is required"),
        description: z.string().min(1, "Criterion description is required"),
        weight: z
          .number()
          .min(1, "Weight must be at least 1%")
          .max(100, "Weight must not exceed 100%"),
      })
    )
    .refine((criteria) => {
      const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
      return totalWeight === 100;
    }, "Criteria weights must sum to 100%"),
  maxTeamSize: z
    .number()
    .min(1, "Maximum team size must be at least 1")
    .max(10, "Maximum team size must not exceed 10"),
  minTeamSize: z.number().min(1, "Minimum team size must be at least 1"),
  rules: z
    .array(z.string().min(1, "Rule cannot be empty"))
    .min(1, "Add at least one rule"),
  requirements: z.array(z.string().min(1, "Requirement cannot be empty")),
});

type HackathonFormValues = z.infer<typeof hackathonFormSchema>;

export default function NewHackathonPage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<HackathonFormValues>({
    resolver: zodResolver(hackathonFormSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      tracks: [],
      prizes: [],
      judgingCriteria: [],
      rules: [""],
      requirements: [],
      maxTeamSize: 5,
      minTeamSize: 1,
    },
  });

  async function onSubmit(data: HackathonFormValues) {
    setIsLoading(true);
    try {
      // TODO: Implement hackathon creation logic
      console.log(data);
      toast({
        title: "Hackathon Created",
        description: "Your hackathon has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Hackathon
          </h1>
          <p className="text-muted-foreground">
            Set up a new hackathon event with prizes, tracks, and judging
            criteria.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="prizes">Prizes & Tracks</TabsTrigger>
            <TabsTrigger value="judging">Judging</TabsTrigger>
            <TabsTrigger value="rules">Rules & Requirements</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <BasicInfoSection form={form} />
              </TabsContent>

              {/* Prizes & Tracks Tab */}
              <TabsContent value="prizes">
                <PrizesAndTracksSection form={form} />
              </TabsContent>

              {/* Judging Tab */}
              <TabsContent value="judging">
                <JudgingSection form={form} />
              </TabsContent>

              {/* Rules Tab */}
              <TabsContent value="rules">
                <RulesSection form={form} />
              </TabsContent>

              <NavigationButtons
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLoading={isLoading}
                isLastStep={activeTab === "rules"}
              />
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
}
