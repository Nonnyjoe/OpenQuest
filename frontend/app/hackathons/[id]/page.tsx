// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  GitBranch,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
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
import { HackathonRegistration } from "@/components/hackathon/registration-form";
import { HackathonTimeline } from "@/components/hackathon/timeline";
import { PrizesDisplay } from "@/components/hackathon/prizes-display";
import { JudgingCriteria } from "@/components/hackathon/judging-criteria";

// interface HackathonDetailsProps {
//   params: {
//     id: string;
//   };
// }

export default function HackathonDetailsPage({
  params,
}: HackathonDetailsProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const hackathon = {
    id: params.id,
    title: "Web3 Innovation Hackathon",
    description: "Build the future of decentralized applications",
    startDate: "2024-04-15T00:00:00Z",
    endDate: "2024-04-30T23:59:59Z",
    registrationDeadline: "2024-04-14T23:59:59Z",
    status: "upcoming", // upcoming, active, completed
    maxTeamSize: 4,
    minTeamSize: 1,
    participantCount: 120,
    prizePool: "10,000 USDC",
    tracks: [
      {
        id: "1",
        name: "DeFi",
        description: "Build innovative decentralized finance solutions",
        prize: "3,000 USDC",
      },
      {
        id: "2",
        name: "NFT & Gaming",
        description: "Create engaging Web3 gaming experiences with NFTs",
        prize: "2,500 USDC",
      },
      {
        id: "3",
        name: "DAO & Governance",
        description: "Develop tools for decentralized organization management",
        prize: "2,500 USDC",
      },
      {
        id: "4",
        name: "Social Impact",
        description:
          "Blockchain solutions for social and environmental challenges",
        prize: "2,000 USDC",
      },
    ],
    timeline: [
      {
        date: "2024-04-04",
        title: "Registration Opens",
        description: "Registration opens for the hackathon",
      },
      {
        date: "2024-04-14",
        title: "Registration Closes",
        description: "Registration closes for the hackathon",
      },
      {
        date: "2024-04-15",
        title: "Hackathon Starts",
        description: "Opening ceremony and team formation",
      },
      {
        date: "2024-04-30",
        title: "Hackathon Ends",
        description: "Closing ceremony and prize distribution",
      },
    ],
    judgingCriteria: [
      {
        name: "Technical Innovation",
        description: "Uniqueness and complexity of the solution",
        weight: 30,
      },
      {
        name: "User Experience",
        description: "Ease of use and user engagement",
        weight: 25,
      },
      {
        name: "Impact",
        description: "Relevance to the hackathon theme and societal value",
        weight: 20,
      },
      {
        name: "Presentation",
        description: "Clarity and effectiveness of the presentation",
        weight: 15,
      },
    ],
  };

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              {hackathon.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {hackathon.description}
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setIsRegistering(true)}
            disabled={hackathon.status !== "upcoming"}
          >
            Register Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(hackathon.startDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(hackathon.endDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-sm text-muted-foreground">
                  {hackathon.participantCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Prize Pool</p>
                <p className="text-sm text-muted-foreground">
                  {hackathon.prizePool}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prizes">Prizes & Tracks</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="judging">Judging Criteria</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Hackathon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Join us for an exciting hackathon focused on building the
                  future of Web3. Whether you're a developer, designer, or
                  product enthusiast, this is your chance to innovate and create
                  impactful solutions.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">What to Expect</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Expert mentorship from industry leaders</li>
                      <li>Workshops and technical resources</li>
                      <li>Networking opportunities</li>
                      <li>Exciting prizes across multiple tracks</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Who Should Participate</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Blockchain developers</li>
                      <li>UI/UX designers</li>
                      <li>Product managers</li>
                      <li>Web3 enthusiasts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prizes">
            <PrizesDisplay prizes={hackathon.tracks} />
          </TabsContent>

          <TabsContent value="timeline">
            <HackathonTimeline events={hackathon.timeline} />
          </TabsContent>

          <TabsContent value="judging">
            <JudgingCriteria criteria={hackathon.judgingCriteria} />
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle>Hackathon Rules</CardTitle>
                <CardDescription>
                  Please ensure you follow these guidelines throughout the
                  hackathon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">General Rules</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                      <li>
                        All code must be written during the hackathon period
                      </li>
                      <li>Teams must consist of 1-4 members</li>
                      <li>Each participant can only be part of one team</li>
                      <li>Projects must be open-source and original work</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Code of Conduct</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                      <li>
                        Respect all participants and maintain professional
                        conduct
                      </li>
                      <li>No plagiarism or use of existing projects</li>
                      <li>
                        Follow fair play and ethical development practices
                      </li>
                      <li>Maintain transparency in your development process</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">
                      Submission Requirements
                    </h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                      <li>Projects must be submitted before the deadline</li>
                      <li>Include comprehensive documentation</li>
                      <li>Provide a working demo or prototype</li>
                      <li>Submit source code via GitHub repository</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Registration Modal */}
        {isRegistering && (
          <HackathonRegistration
            hackathonId={params.id}
            onClose={() => setIsRegistering(false)}
          />
        )}
      </div>
    </div>
  );
}
