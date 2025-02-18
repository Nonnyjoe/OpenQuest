"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Copy,
  Check,
  UserPlus,
  UserMinus,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

interface TeamManagementProps {
  hackathonId: string;
  team: {
    id: string;
    name: string;
    code: string;
    members: {
      id: string;
      name: string;
      role: string;
      avatar: string;
    }[];
    maxSize: number;
  } | null;
}

export function TeamManagement({ hackathonId, team }: TeamManagementProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [teamCode, setTeamCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateTeam = async (name: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/hackathons/${hackathonId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error("Failed to create team");

      toast({
        title: "Team Created",
        description: "Your team has been created successfully.",
      });
      setIsCreating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinTeam = async (code: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/hackathons/${hackathonId}/teams/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) throw new Error("Failed to join team");

      toast({
        title: "Team Joined",
        description: "You have successfully joined the team.",
      });
      setIsJoining(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join team. Please check the team code.",
        variant: "destructive",
      });
    }
  };

  const copyTeamCode = () => {
    if (!team?.code) return;
    navigator.clipboard.writeText(team.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Code Copied",
      description: "Team code copied to clipboard.",
    });
  };

  if (!team) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Join or Create a Team</CardTitle>
            <CardDescription>
              Work together with other participants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Team
            </Button>
            <Button variant="outline" onClick={() => setIsJoining(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Join Existing Team
            </Button>
          </CardContent>
        </Card>

        {/* Create Team Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a team and invite others to join
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="Enter team name"
                  onChange={(e) => setTeamCode(e.target.value)}
                />
              </div>
              <Button onClick={() => handleCreateTeam(teamCode)}>
                Create Team
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Join Team Dialog */}
        <Dialog open={isJoining} onOpenChange={setIsJoining}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Team</DialogTitle>
              <DialogDescription>
                Enter the team code to join an existing team
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="teamCode">Team Code</Label>
                <Input
                  id="teamCode"
                  placeholder="Enter team code"
                  onChange={(e) => setTeamCode(e.target.value)}
                />
              </div>
              <Button onClick={() => handleJoinTeam(teamCode)}>
                Join Team
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription>
              Team Code: {team.code}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={copyTeamCode}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </CardDescription>
          </div>
          <p className="text-sm text-muted-foreground">
            {team.members.length}/{team.maxSize} Members
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
