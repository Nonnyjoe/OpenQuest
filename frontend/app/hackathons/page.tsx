"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Code,
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

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  teamSize: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  participants: number;
  prizePool: string;
  status: "upcoming" | "active" | "completed";
  tags: string[];
  organization: string;
}

const hackathons: Hackathon[] = [
  {
    id: "1",
    title: "DeFi Innovation Challenge",
    description:
      "Build the next generation of decentralized finance applications using Cartesi's technology.",
    startDate: "2024-04-15T00:00:00Z",
    endDate: "2024-04-30T23:59:59Z",
    teamSize: "1-4",
    difficulty: "Intermediate",
    participants: 245,
    prizePool: "50,000 USDC",
    status: "upcoming",
    tags: ["DeFi", "Cartesi", "Smart Contracts"],
    organization: "Cartesi Foundation",
  },
  {
    id: "2",
    title: "Web3 Gaming Hackathon",
    description:
      "Create innovative blockchain games with verifiable computation using Cartesi.",
    startDate: "2024-05-01T00:00:00Z",
    endDate: "2024-05-15T23:59:59Z",
    teamSize: "2-5",
    difficulty: "Advanced",
    participants: 180,
    prizePool: "75,000 USDC",
    status: "upcoming",
    tags: ["Gaming", "Web3", "Cartesi"],
    organization: "GameFi DAO",
  },
  {
    id: "3",
    title: "Social Impact dApps",
    description:
      "Develop applications that solve real-world problems using blockchain technology.",
    startDate: "2024-03-20T00:00:00Z",
    endDate: "2024-04-10T23:59:59Z",
    teamSize: "1-3",
    difficulty: "Beginner",
    participants: 320,
    prizePool: "30,000 USDC",
    status: "active",
    tags: ["Social Impact", "dApps", "Cartesi"],
    organization: "Impact DAO",
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

export default function HackathonsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // Filter hackathons based on search query and difficulty
  const filteredHackathons = useMemo(() => {
    return hackathons.filter((hackathon) => {
      const matchesSearch =
        searchQuery.trim() === ""
          ? true
          : [hackathon.title, hackathon.description, ...hackathon.tags]
              .join(" ")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        difficultyFilter === "all"
          ? true
          : hackathon.difficulty.toLowerCase() === difficultyFilter;

      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, difficultyFilter]);

  // Filter by status
  const upcomingHackathons = filteredHackathons.filter(
    (hackathon) => hackathon.status === "upcoming"
  );
  const activeHackathons = filteredHackathons.filter(
    (hackathon) => hackathon.status === "active"
  );
  const completedHackathons = filteredHackathons.filter(
    (hackathon) => hackathon.status === "completed"
  );

  const HackathonCard = ({ hackathon }: { hackathon: Hackathon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/hackathons/${hackathon.id}`}>
        <Card className="group hover-card-animation">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-medium hover-card-title">
                      {hackathon.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={difficultyColors[hackathon.difficulty]}
                    >
                      {hackathon.difficulty}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={statusColors[hackathon.status]}
                    >
                      {hackathon.status.charAt(0).toUpperCase() +
                        hackathon.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hackathon.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hackathon.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(hackathon.startDate).toLocaleDateString()} -{" "}
                      {new Date(hackathon.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Team Size: {hackathon.teamSize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>Prize Pool: {hackathon.prizePool}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span>{hackathon.organization}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View Details
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Hackathons</h1>
          <p className="text-lg text-muted-foreground">
            Join exciting hackathons, build innovative projects, and compete for
            prizes.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Hackathons
              </CardTitle>
              <Code className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeHackathons.length}
              </div>
              <p className="text-xs text-muted-foreground">Live right now</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Prize Pool
              </CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">155,000 USDC</div>
              <p className="text-xs text-muted-foreground">Available to win</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Participants
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">745</div>
              <p className="text-xs text-muted-foreground">
                Across all hackathons
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search hackathons by title, description, or tags..."
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

        {/* Tabs Section */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All Hackathons
              <Badge variant="secondary" className="ml-2 bg-primary/10">
                {filteredHackathons.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming
              <Badge variant="secondary" className="ml-2 bg-primary/10">
                {upcomingHackathons.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              <Badge variant="secondary" className="ml-2 bg-green-500/10">
                {activeHackathons.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <Badge variant="secondary" className="ml-2 bg-muted">
                {completedHackathons.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
