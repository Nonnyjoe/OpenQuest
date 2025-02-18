"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Github, Link2, Loader2, Upload } from "lucide-react";
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

const projectSchema = z.object({
  title: z.string().min(3, "Project title must be at least 3 characters"),
  description: z.string().min(100, "Please provide a detailed description"),
  track: z.string().min(1, "Please select a track"),
  githubUrl: z
    .string()
    .url("Please enter a valid URL")
    .regex(/github\.com/, "Must be a GitHub repository URL"),
  demoUrl: z.string().url("Please enter a valid URL").optional(),
  videoUrl: z.string().url("Please enter a valid URL").optional(),
  techStack: z.string().min(1, "Please list the technologies used"),
  challenges: z.string().min(50, "Please describe the challenges faced"),
  futureWork: z.string().min(50, "Please describe future improvements"),
});

interface ProjectSubmissionProps {
  hackathonId: string;
  team: {
    id: string;
    name: string;
  } | null;
  submission: {
    status: "not_started" | "in_progress" | "submitted";
    deadline: string;
  };
}

export function ProjectSubmission({
  hackathonId,
  team,
  submission,
}: ProjectSubmissionProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      track: "",
      githubUrl: "",
      demoUrl: "",
      videoUrl: "",
      techStack: "",
      challenges: "",
      futureWork: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    if (!team) {
      toast({
        title: "Team Required",
        description: "You must be part of a team to submit a project",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/hackathons/${hackathonId}/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId: team.id,
            ...values,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit project");

      toast({
        title: "Project Submitted!",
        description: "Your project has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your project. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  if (!team) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Required</CardTitle>
          <CardDescription>
            You need to be part of a team to submit a project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            Create or Join a Team First
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isDeadlinePassed = new Date(submission.deadline) < new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Submission</CardTitle>
        <CardDescription>
          Submit your project details and documentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="track"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Track</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project track" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="defi">DeFi</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                      <SelectItem value="dao">DAO</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project in detail..."
                      className="h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include the problem you're solving and your solution
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repository</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input
                          placeholder="https://github.com/username/repo"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => window.open(field.value, "_blank")}
                          disabled={!field.value}
                        >
                          <Github className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="demoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demo URL (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input placeholder="https://your-demo.com" {...field} />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => window.open(field.value, "_blank")}
                          disabled={!field.value}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="techStack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., React, Solidity, Hardhat, IPFS"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    List the main technologies used in your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={isSubmitting || isDeadlinePassed}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {submission.status === "submitted"
                  ? "Update Submission"
                  : "Submit Project"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
