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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { protocolService } from "@/services/protocol-service";
import { useRouter } from "next/navigation";

const recommendedTags = [
  "Web3",
  "DeFi",
  "Layer 1",
  "Layer 2",
  "Rollups",
  "Gaming",
  "NFT",
  "DAO",
  "Privacy",
  "Infrastructure",
  "Smart Contracts",
  "Scaling",
];

const protocolFormSchema = z.object({
  name: z.string().min(2, "Protocol name must be at least 2 characters"),
  description: z.string().min(10, "Please provide a detailed description"),
  website: z.string().url("Please enter a valid URL"),
  contactEmail: z.string().email("Please enter a valid email"),
  twitter: z.string().optional(),
  github: z.string().optional(),
  discord: z.string().optional(),
  logo: z.any().optional(),
  tags: z.array(z.string()).min(1, "Add at least one tag"),
  staffMembers: z.array(z.string()).optional(),
});

type ProtocolFormValues = z.infer<typeof protocolFormSchema>;

export default function NewProtocolPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [openTagSelect, setOpenTagSelect] = useState(false);
  const router = useRouter();

  const form = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolFormSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      contactEmail: "",
      twitter: "",
      github: "",
      discord: "",
      tags: [],
    },
  });

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      form.setValue("tags", newTags);
    }
    setOpenTagSelect(false);
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  const handleCustomTagSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customTag.trim()) {
      e.preventDefault();
      addTag(customTag.trim());
      setCustomTag("");
    }
  };

  async function onSubmit(data: ProtocolFormValues) {
    setIsLoading(true);
    try {
      await protocolService.register({ name: data.name });

      if (data.staffMembers?.length) {
        for (const staffUuid of data.staffMembers) {
          await protocolService.addStaff({
            protocol_name: data.name,
            staff_uuid: staffUuid,
          });
        }
      }

      toast({
        title: "Success",
        description: "Protocol created successfully",
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
            Register New Protocol
          </h1>
          <p className="text-muted-foreground">
            Create a new protocol to start managing quizzes and hackathons.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Protocol Details</CardTitle>
              <CardDescription>
                Provide information about your protocol
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your protocol..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://your-protocol.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="contact@protocol.com"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="@handle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub</FormLabel>
                          <FormControl>
                            <Input placeholder="organization" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discord"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discord</FormLabel>
                          <FormControl>
                            <Input placeholder="Invite link" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protocol Logo</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                field.onChange(e.target.files?.[0])
                              }
                              className="hidden"
                              id="logo-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document.getElementById("logo-upload")?.click()
                              }
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Logo
                            </Button>
                            {field.value && (
                              <span className="text-sm text-muted-foreground">
                                {(field.value as File).name}
                              </span>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Recommended size: 256x256px. Max file size: 2MB
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormDescription>
                          Select multiple tags that best describe your protocol
                        </FormDescription>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {tag}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                  onClick={() => removeTag(tag)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Popover
                              open={openTagSelect}
                              onOpenChange={setOpenTagSelect}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                >
                                  Add Tags
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[200px] p-0"
                                align="start"
                              >
                                <Command>
                                  <CommandInput placeholder="Search tags..." />
                                  <CommandEmpty>No tags found.</CommandEmpty>
                                  <CommandGroup>
                                    {recommendedTags
                                      .filter(
                                        (tag) => !selectedTags.includes(tag)
                                      )
                                      .map((tag) => (
                                        <CommandItem
                                          key={tag}
                                          value={tag}
                                          onSelect={(currentValue) => {
                                            addTag(currentValue);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          {tag}
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <div className="flex-1">
                              <Input
                                placeholder="Or type a custom tag and press Enter"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                onKeyDown={handleCustomTagSubmit}
                                className="h-8"
                              />
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Register Protocol
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
