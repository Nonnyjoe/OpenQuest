"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  Clock,
  Trophy,
  Users,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { ReminderButton } from "@/components/quiz/reminder-button";

// Types for our quiz data
interface Quiz {
  id: string;
  title: string;
  description: string;
  startDate: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  participants: number;
  reward: string;
  status: "upcoming" | "active" | "completed";
  tags: string[];
  hasReminder?: boolean;
}

const quizzes: Quiz[] = [
  {
    id: "1",
    title: "Solidity Smart Contract Challenge",
    description:
      "Test your knowledge of Solidity and smart contract development with this comprehensive quiz.",
    startDate: "2024-04-01T15:00:00Z",
    duration: "45 minutes",
    difficulty: "Intermediate",
    participants: 156,
    reward: "500 USDC",
    status: "upcoming",
    tags: ["Solidity", "Smart Contracts", "DeFi"],
  },
  {
    id: "2",
    title: "Ethereum Layer 2 Scaling Quiz",
    description:
      "Assess your understanding of Ethereum's Layer 2 solutions, including Optimistic and ZK rollups.",
    startDate: "2024-04-10T18:30:00Z",
    duration: "40 minutes",
    difficulty: "Advanced",
    participants: 98,
    reward: "300 USDC",
    status: "upcoming",
    tags: ["Ethereum", "Layer 2", "Rollups"],
  },
  {
    id: "3",
    title: "Blockchain Security Essentials",
    description:
      "Learn about common blockchain security threats and test your knowledge of best practices.",
    startDate: "2024-03-25T12:00:00Z",
    duration: "50 minutes",
    difficulty: "Intermediate",
    participants: 210,
    reward: "400 USDC",
    status: "active",
    tags: ["Security", "Blockchain", "Auditing"],
  },
  {
    id: "4",
    title: "Rust for Web3 Development",
    description:
      "Evaluate your skills in using Rust for building blockchain applications, particularly in Solana development.",
    startDate: "2024-04-05T14:00:00Z",
    duration: "45 minutes",
    difficulty: "Advanced",
    participants: 130,
    reward: "600 USDC",
    status: "upcoming",
    tags: ["Rust", "Web3", "Solana"],
  },
  {
    id: "5",
    title: "Web3 Frontend Development Challenge",
    description:
      "Test your proficiency in integrating Web3.js, Ethers.js, and dApp front-end frameworks.",
    startDate: "2024-03-20T16:00:00Z",
    duration: "35 minutes",
    difficulty: "Beginner",
    participants: 180,
    reward: "250 USDC",
    status: "completed",
    tags: ["Web3", "Frontend", "dApps"],
  },
  {
    id: "6",
    title: "Zero-Knowledge Proofs Mastery Quiz",
    description:
      "Challenge yourself with questions on ZK-SNARKs, ZK-STARKs, and their applications in blockchain privacy.",
    startDate: "2024-04-15T10:30:00Z",
    duration: "55 minutes",
    difficulty: "Advanced",
    participants: 75,
    reward: "700 USDC",
    status: "upcoming",
    tags: ["ZK Proofs", "Privacy", "Cryptography"],
  },
];

const difficultyColors = {
  Beginner: "bg-green-500/10 text-green-500",
  Intermediate: "bg-yellow-500/10 text-yellow-500",
  Advanced: "bg-red-500/10 text-red-500",
};

const statusColors = {
  upcoming: "bg-primary/10 text-primary",
  active: "bg-green-500/10 text-green-500",
  completed: "bg-muted text-muted-foreground",
};

export default function QuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // Filter quizzes based on search query and difficulty
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchesSearch =
        searchQuery.trim() === ""
          ? true
          : [quiz.title, quiz.description, ...quiz.tags]
              .join(" ")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        difficultyFilter === "all"
          ? true
          : quiz.difficulty.toLowerCase() === difficultyFilter;

      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, difficultyFilter]);

  // Filter by status
  const upcomingQuizzes = filteredQuizzes.filter(
    (quiz) => quiz.status === "upcoming"
  );
  const activeQuizzes = filteredQuizzes.filter(
    (quiz) => quiz.status === "active"
  );
  const completedQuizzes = filteredQuizzes.filter(
    (quiz) => quiz.status === "completed"
  );

  // Component to render quiz cards
  const QuizCard = ({ quiz }: { quiz: Quiz }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover-card-animation">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium hover-card-title">
                    {quiz.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={difficultyColors[quiz.difficulty]}
                  >
                    {quiz.difficulty}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={statusColors[quiz.status]}
                  >
                    {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {quiz.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {quiz.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Starts {new Date(quiz.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{quiz.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{quiz.participants} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>{quiz.reward}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {quiz.status === "upcoming" && (
                <ReminderButton
                  quizId={quiz.id}
                  isReminded={quiz.hasReminder}
                />
              )}
              <Link href={`/quizzes/${quiz.id}`}>
                <Button
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View Details
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-lg text-muted-foreground">
            Participate in timed challenges, test your knowledge, and earn
            rewards.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Quizzes
              </CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Rewards
              </CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,000 USDC</div>
              <p className="text-xs text-muted-foreground">Available to win</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Participants
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">Active this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search quizzes by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Bell className="mr-2 h-4 w-4" />
              Subscribe
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Found {filteredQuizzes.length}{" "}
            {filteredQuizzes.length === 1 ? "quiz" : "quizzes"}
            {difficultyFilter !== "all" && ` in ${difficultyFilter} difficulty`}
          </p>
        )}

        {/* Tabs and Filters */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">
                All Quizzes
                {filteredQuizzes.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary/10">
                    {filteredQuizzes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming
                {upcomingQuizzes.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary/10">
                    {upcomingQuizzes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                {activeQuizzes.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-green-500/10">
                    {activeQuizzes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedQuizzes.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-muted">
                    {completedQuizzes.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-4">
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))
            ) : (
              <EmptyState
                message={
                  searchQuery
                    ? `No quizzes found matching "${searchQuery}"`
                    : "No quizzes available at the moment."
                }
              />
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingQuizzes.length > 0 ? (
              upcomingQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))
            ) : (
              <EmptyState message="No upcoming quizzes at the moment." />
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeQuizzes.length > 0 ? (
              activeQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))
            ) : (
              <EmptyState message="No active quizzes at the moment." />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedQuizzes.length > 0 ? (
              completedQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))
            ) : (
              <EmptyState message="No completed quizzes yet." />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="rounded-full bg-primary/10 p-3">
        <Trophy className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-medium">No Quizzes Found</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
