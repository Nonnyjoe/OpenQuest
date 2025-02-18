"use client";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { protocolService } from "@/services/protocol-service";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const protocolSchema = z.object({
  name: z.string().min(2, "Protocol name must be at least 2 characters"),
});

type ProtocolFormValues = z.infer<typeof protocolSchema>;

export default function CreateProtocolPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    setIsClient(true);

    if (typeof document !== "undefined") {
    }
  }, [user]);

  // Don't render anything until we're on the client
  if (!isClient) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    // Handle redirects in useEffect
    if (user?.role === "admin" || user?.role === "protocol_admin") {
      router.push("/admin/protocols/new");
    }
  }, [user, router]);

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  async function onSubmit(data: ProtocolFormValues) {
    setIsLoading(true);
    try {
      await protocolService.register({ name: data.name });
      toast({
        title: "Success",
        description:
          "Protocol created successfully. You are now a protocol admin.",
      });
      router.push("/admin/protocols");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create protocol",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Your First Protocol
          </h1>
          <p className="text-muted-foreground">
            Register your protocol to start managing quizzes and hackathons
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Protocol Details</CardTitle>
            <CardDescription>
              Enter your protocol name to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protocol Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter protocol name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Protocol
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
