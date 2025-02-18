"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { protocolService } from "@/services/protocol-service";
import { Skeleton } from "@/components/ui/skeleton";
import { UIProtocol } from "@/types/protocol";
import { quizService, Quiz as APIQuiz } from "@/services/quiz-service";
import { QuizList } from "@/components/quiz/quiz-list";

interface UIQuiz {
  id: string;
  title: string;
  description: string;
  startDate: string;
  duration: string;
  difficulty: string;
  participants: number;
  totalParticipants: number;
  reward: string;
  status: "upcoming" | "active" | "completed";
  protocol: string;
  tags?: string[];
}

export default function ProtocolQuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const [protocol, setProtocol] = useState<UIProtocol | null>(null);
  const [quizzes, setQuizzes] = useState<UIQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [protocolData, quizzesData] = await Promise.all([
          protocolService.getProtocolById(params.id as string),
          quizService.getAllQuizzes(),
        ]);

        setProtocol(protocolData);

        const transformedQuizzes = quizzesData
          .filter((quiz: APIQuiz) => quiz.protocol === params.id)
          .map((quiz: APIQuiz) => ({
            id: quiz.uuid,
            title: quiz.name,
            description: quiz.description,
            startDate: new Date(quiz.start_time * 1000).toISOString(),
            duration: `${quiz.duration_in_sec_timestamp / 60} minutes`,
            difficulty: quiz.difficulty,
            participants: quiz.participants.length,
            totalParticipants: quiz.participants.length,
            reward: `${quiz.total_reward} USDC`,
            status: quiz.status.toLowerCase() as
              | "upcoming"
              | "active"
              | "completed",
            tags: [],
            protocol: quiz.protocol,
          }));

        setQuizzes(transformedQuizzes);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {protocol?.name} Quizzes
          </h1>
          <p className="text-muted-foreground">
            Manage quizzes for {protocol?.name}
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/admin/quizzes/new?protocolId=${params.id}`)
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Create Quiz
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
          <CardDescription>View and manage all quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <QuizList
            quizzes={filteredQuizzes as any}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        </CardContent>
      </Card>
    </div>
  );
}
