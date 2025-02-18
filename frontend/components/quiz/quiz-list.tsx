"use client";

import { Quiz } from "@/types/protocol";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface QuizListProps {
  quizzes: Quiz[];
  isLoading: boolean;
  searchQuery: string;
}

export function QuizList({ quizzes, isLoading, searchQuery }: QuizListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          {searchQuery
            ? "No quizzes found matching your search"
            : "No quizzes available"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="hover:bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{quiz.title}</h3>
                  <Badge
                    variant={
                      quiz.status === "published" ? "default" : "secondary"
                    }
                  >
                    {quiz.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {quiz.description}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {quiz.duration} min
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {quiz.totalParticipants} participants
                  </div>
                  <div className="flex items-center">
                    <Trophy className="mr-1 h-4 w-4" />
                    {quiz.reward}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/quizzes/${quiz.id}`)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
