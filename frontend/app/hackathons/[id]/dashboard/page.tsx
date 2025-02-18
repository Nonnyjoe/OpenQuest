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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  Plus,
  UserPlus,
  Router,
} from "lucide-react";
import { TeamManagement } from "@/components/hackathon/team-management";
import { ProjectSubmission } from "@/components/hackathon/project-submission";
import { HackathonProgress } from "@/components/hackathon/progress";

export default function HackathonDashboard() {
  const params = useParams();
  const hackathonId = params?.id as string;
  const [hackathon, setHackathon] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  useEffect(() => {
    async function fetchHackathon() {
      try {
        const response = await fetch(`/api/hackathons/${hackathonId}`);
        const data = await response.json();
        setHackathon(data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }

    if (hackathonId) {
      fetchHackathon();
    }
  }, [hackathonId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Header with Progress */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {hackathon?.title}
            </h1>
            <p className="text-muted-foreground">
              Time Remaining: {hackathon?.timeRemaining}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/hackathons")}>
            Back to Hackathons
          </Button>
        </div>

        <HackathonProgress />

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team Management</TabsTrigger>
            <TabsTrigger value="submission">Project Submission</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Team Status</CardTitle>
                  <CardDescription>
                    Manage your team or join one
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hackathon?.team ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{hackathon.team.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {hackathon.team.members.length}/
                          {hackathon.team.maxSize} Members
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("team")}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Manage Team
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        You haven't joined a team yet
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => setActiveTab("team")}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Team
                        </Button>
                        <Button variant="outline">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Join Team
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submission Status</CardTitle>
                  <CardDescription>
                    Track your project submission
                  </CardDescription>
                </CardHeader>
                <CardContent>{/* Submission status content */}</CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <TeamManagement hackathonId={hackathonId} team={hackathon?.team} />
          </TabsContent>

          <TabsContent value="submission">
            <ProjectSubmission
              hackathonId={hackathonId}
              team={hackathon?.team}
              submission={hackathon?.submission as any}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
