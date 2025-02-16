"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Calendar,
  Clock,
  User,
  Mail,
  Github,
  Award,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { WalletConnect } from "@/components/profile/wallet-connect";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/auth-service";

// Add these interfaces at the top of the file
interface ProfileData {
  avatar?: string;
  username: string;
  email: string;
  achievements: string[];
  level: number;
  totalPoints: number;
  xp: number;
  xpToNextLevel: number;
  githubUsername?: string;
  walletAddress?: string;
  participatedHackathons: Array<{
    id: string;
    title: string;
    status: string;
    date: string;
    teamName: string;
    position?: number;
    points: number;
  }>;
  participatedQuizzes: Array<{
    id: string;
    title: string;
    status: string;
    date: string;
    score?: number;
    points: number;
  }>;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authService.getUserById(user.id);

        // Map UserData to ProfileData with safe defaults
        const profileData: ProfileData = {
          avatar: undefined,
          username: userData.username || "User",
          email: userData.email,
          achievements: [], // Will be populated later
          level: 1,
          totalPoints: userData.total_reward || 0,
          xp: 0,
          xpToNextLevel: 100,
          githubUsername: undefined,
          walletAddress: userData.walletAddress ?? undefined,
          participatedHackathons: [],
          participatedQuizzes: (userData.quizzes || []).map((quiz) => ({
            id: quiz.id || "",
            title: quiz.title || "Untitled Quiz",
            status: quiz.status || "pending",
            date: quiz.date || new Date().toISOString(),
            score: quiz.score,
            points: quiz.points || 0,
          })),
        };

        setProfileData(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Show error toast or message here
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-lg">No profile data available</p>
        </div>
      </div>
    );
  }

  // Update the handlers with proper types
  const handleProfileUpdate = (updatedData: Partial<ProfileData>) => {
    if (profileData) {
      setProfileData({ ...profileData, ...updatedData });
    }
  };

  const handleWalletConnect = (address: string) => {
    if (profileData) {
      setProfileData({ ...profileData, walletAddress: address });
    }
  };

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex items-start gap-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileData?.avatar} />
            <AvatarFallback>
              {profileData?.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {profileData?.username}
              </h1>
              <div className="flex gap-2 mt-2">
                {profileData?.achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary">
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-8">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Level</div>
                <div className="text-2xl font-bold">{profileData?.level}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Total Points
                </div>
                <div className="text-2xl font-bold text-primary">
                  {profileData?.totalPoints}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>XP Progress</span>
                <span>
                  {profileData?.xp} / {profileData?.xpToNextLevel}
                </span>
              </div>
              <Progress
                value={
                  ((profileData?.xp ?? 0) / (profileData?.xpToNextLevel ?? 1)) *
                  100
                }
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Mail className="h-5 w-5 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profileData?.email}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Github className="h-5 w-5 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">GitHub</p>
                <p className="font-medium">{profileData?.githubUsername}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Wallet className="h-5 w-5 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">Wallet</p>
                <p className="font-medium">{profileData?.walletAddress}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Edit Profile button */}
        <div className="flex justify-end">
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        </div>

        {/*MY TODO: Add Wallet Connect if no wallet is connected */}
        {!profileData?.walletAddress && (
          <WalletConnect onConnect={handleWalletConnect} />
        )}

        {/* Edit Profile Dialog */}
        <EditProfileDialog
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          userData={profileData}
          onUpdate={handleProfileUpdate}
        />

        {/* Activity Tabs */}
        <Tabs defaultValue="hackathons" className="space-y-8">
          <TabsList>
            <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="hackathons">
            <div className="space-y-4">
              {profileData?.participatedHackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-4">
              {profileData?.participatedQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid gap-4 md:grid-cols-3">
              {profileData?.achievements.map((achievement, index) => (
                <Card key={index}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <Award className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement}</h3>
                      <p className="text-sm text-muted-foreground">
                        Achievement Unlocked
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Add types for the card components
interface HackathonCardProps {
  hackathon: {
    id: string;
    title: string;
    status: string;
    date: string;
    teamName: string;
    position?: number;
    points: number;
  };
}

function HackathonCard({ hackathon }: HackathonCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{hackathon.title}</h3>
            <Badge
              variant={
                hackathon.status === "completed" ? "default" : "secondary"
              }
            >
              {hackathon.status}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(hackathon.date).toLocaleDateString()}
            </div>
            <div>Team: {hackathon.teamName}</div>
            {hackathon.position && (
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-primary" />
                Position #{hackathon.position}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Points Earned</div>
          <div className="text-xl font-bold text-primary">
            {hackathon.points}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    status: string;
    date: string;
    score?: number;
    points: number;
  };
}

function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{quiz.title}</h3>
            <Badge
              variant={quiz.status === "completed" ? "default" : "secondary"}
            >
              {quiz.status}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(quiz.date).toLocaleDateString()}
            </div>
            {quiz.score && (
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-primary" />
                Score: {quiz.score}%
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Points Earned</div>
          <div className="text-xl font-bold text-primary">{quiz.points}</div>
        </div>
      </CardContent>
    </Card>
  );
}
