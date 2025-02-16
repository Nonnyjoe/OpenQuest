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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ProjectTrack } from "@/types/hackathon";
import { Badge } from "@/components/ui/badge";
import { useFieldArray } from "react-hook-form";

interface PrizesAndTracksSectionProps {
  form: UseFormReturn<any>;
}

export function PrizesAndTracksSection({ form }: PrizesAndTracksSectionProps) {
  const {
    fields: prizeFields,
    append: appendPrize,
    remove: removePrize,
  } = useFieldArray({
    control: form.control,
    name: "prizes",
  });

  const selectedTracks = form.watch("tracks") || [];

  const toggleTrack = (track: ProjectTrack) => {
    const current = form.getValues("tracks");
    const updated = current.includes(track)
      ? current.filter((t: ProjectTrack) => t !== track)
      : [...current, track];
    form.setValue("tracks", updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prizes & Tracks</CardTitle>
        <CardDescription>
          Define the prizes and project tracks for your hackathon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <FormLabel>Project Tracks</FormLabel>
          <div className="flex flex-wrap gap-2">
            {Object.values(ProjectTrack).map((track) => (
              <Badge
                key={track}
                variant={selectedTracks.includes(track) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTrack(track)}
              >
                {track.charAt(0).toUpperCase() + track.slice(1)}
              </Badge>
            ))}
          </div>
          <FormMessage>
            {form.formState.errors.tracks?.message as string}
          </FormMessage>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Prizes</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendPrize({
                  id: crypto.randomUUID(),
                  track: ProjectTrack.OTHER,
                  title: "",
                  description: "",
                  amount: 0,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Prize
            </Button>
          </div>

          <div className="space-y-4">
            {prizeFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex items-start justify-between">
                      <div className="grid gap-4 flex-1">
                        <FormField
                          control={form.control}
                          name={`prizes.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prize Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter prize title"
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
                            name={`prizes.${index}.track`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Track</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select track" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.values(ProjectTrack).map(
                                      (track) => (
                                        <SelectItem key={track} value={track}>
                                          {track.charAt(0).toUpperCase() +
                                            track.slice(1)}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`prizes.${index}.amount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount (USDC)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
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
                          name={`prizes.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the prize and requirements"
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
                        onClick={() => removePrize(index)}
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
