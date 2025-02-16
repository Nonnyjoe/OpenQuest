"use client";

import { Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Track {
  id: string;
  name: string;
  description: string;
  prize: string;
}

interface PrizesDisplayProps {
  prizes: Track[];
}

export function PrizesDisplay({ prizes }: PrizesDisplayProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {prizes.map((track) => (
        <Card key={track.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{track.name}</CardTitle>
            </div>
            <CardDescription>{track.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{track.prize}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
