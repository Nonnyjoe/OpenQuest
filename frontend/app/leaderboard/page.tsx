"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Award,
  Search,
  ArrowUpDown,
  Code2,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data
const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "1",
    username: "web3wizard",
    avatar: "/avatars/user1.jpg",
    totalPoints: 2500,
    quizPoints: 1500,
    hackathonPoints: 1000,
    achievements: ["Quiz Master", "Hackathon Winner", "Early Adopter"],
    recentActivity: [
      {
        type: "hackathon",
        name: "Web3 Innovation Hackathon",
        points: 1000,
        date: "2024-03-15",
      },
      {
        type: "quiz",
        name: "Solidity Advanced Quiz",
        points: 500,
        date: "2024-03-20",
      },
    ],
  },
  {
    rank: 2,
    userId: "2",
    username: "cryptodev",
    avatar: "/avatars/user2.jpg",
    totalPoints: 2200,
    quizPoints: 1200,
    hackathonPoints: 1000,
    achievements: ["DeFi Expert", "Team Leader"],
    recentActivity: [
      {
        type: "hackathon",
        name: "DeFi Protocol Hackathon",
        points: 1000,
        date: "2024-03-10",
      },
    ],
  },
  // Add more mock entries...
];

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  totalPoints: number;
  quizPoints: number;
  hackathonPoints: number;
  achievements: string[];
  recentActivity: {
    type: "quiz" | "hackathon";
    name: string;
    points: number;
    date: string;
  }[];
}

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "month" | "week">("all");
  const [sortBy, setSortBy] = useState<"total" | "quiz" | "hackathon">("total");

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...mockLeaderboardData];

    if (searchQuery) {
      filtered = filtered.filter((entry) =>
        entry.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (timeFilter !== "all") {
      const now = new Date();
      const timeLimit =
        timeFilter === "month"
          ? new Date(now.setMonth(now.getMonth() - 1))
          : new Date(now.setDate(now.getDate() - 7));

      filtered = filtered.filter((entry) =>
        entry.recentActivity.some(
          (activity) => new Date(activity.date) >= timeLimit
        )
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "quiz":
          return b.quizPoints - a.quizPoints;
        case "hackathon":
          return b.hackathonPoints - a.hackathonPoints;
        default:
          return b.totalPoints - a.totalPoints;
      }
    });

    return filtered.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [searchQuery, timeFilter, sortBy]);

  const getTabContent = (type: "overall" | "quizzes" | "hackathons") => {
    let entries = [...filteredAndSortedEntries];
    if (type === "quizzes") {
      entries.sort((a, b) => b.quizPoints - a.quizPoints);
    } else if (type === "hackathons") {
      entries.sort((a, b) => b.hackathonPoints - a.hackathonPoints);
    }

    return (
      <div className="space-y-4">
        {entries.map((entry) => (
          <LeaderboardCard
            key={entry.userId}
            entry={entry}
            highlightField={type}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Header with Stats */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground">
              Top performers in quizzes and hackathons
            </p>
          </div>
          <div className="flex gap-4">
            <Card className="w-[150px]">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {mockLeaderboardData.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Participants</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeFilter === "all" ? "default" : "outline"}
              onClick={() => setTimeFilter("all")}
            >
              All Time
            </Button>
            <Button
              variant={timeFilter === "month" ? "default" : "outline"}
              onClick={() => setTimeFilter("month")}
            >
              This Month
            </Button>
            <Button
              variant={timeFilter === "week" ? "default" : "outline"}
              onClick={() => setTimeFilter("week")}
            >
              This Week
            </Button>
          </div>
        </div>

        {/* Leaderboard Content */}
        <Tabs defaultValue="overall" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
          </TabsList>

          <TabsContent value="overall">{getTabContent("overall")}</TabsContent>
          <TabsContent value="quizzes">{getTabContent("quizzes")}</TabsContent>
          <TabsContent value="hackathons">
            {getTabContent("hackathons")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LeaderboardCard({
  entry,
  highlightField = "overall",
}: {
  entry: LeaderboardEntry;
  highlightField?: "overall" | "quizzes" | "hackathons";
}) {
  const getHighlightedPoints = () => {
    switch (highlightField) {
      case "quizzes":
        return entry.quizPoints;
      case "hackathons":
        return entry.hackathonPoints;
      default:
        return entry.totalPoints;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold w-8">{entry.rank}</div>
              <Avatar className="h-12 w-12">
                <AvatarImage src={entry.avatar} />
                <AvatarFallback>
                  {entry.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{entry.username}</h3>
              <div className="flex gap-2 mt-1">
                {entry.achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Quiz Points</div>
                <div
                  className={`font-semibold ${
                    highlightField === "quizzes" ? "text-primary text-lg" : ""
                  }`}
                >
                  {entry.quizPoints}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Hackathon Points
                </div>
                <div
                  className={`font-semibold ${
                    highlightField === "hackathons"
                      ? "text-primary text-lg"
                      : ""
                  }`}
                >
                  {entry.hackathonPoints}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Total Points
                </div>
                <div
                  className={`font-bold ${
                    highlightField === "overall"
                      ? "text-primary text-xl"
                      : "text-lg"
                  }`}
                >
                  {entry.totalPoints}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
