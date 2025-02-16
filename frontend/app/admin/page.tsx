"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Plus, Settings, Users, Activity, Trophy } from "lucide-react";
import Link from "next/link";
import { useAdminProtocols } from "@/lib/hooks/use-admin-protocols";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: protocols, isLoading } = useAdminProtocols();

  // Add debug logs
  console.log("Admin Dashboard - User's protocols:", protocols);
  console.log("Admin Dashboard - Loading state:", isLoading);

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((n) => (
              <Skeleton key={n} className="h-[200px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your protocols, quizzes, and hackathons
            </p>
          </div>
          <Button asChild>
            <Link href="/protocols/new">
              <Plus className="mr-2 h-4 w-4" />
              New Protocol
            </Link>
          </Button>
        </div>

        {!protocols?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl font-semibold">No Protocols Yet</h2>
                  <p className="text-muted-foreground">
                    Create your first protocol to start managing quizzes and
                    hackathons.
                  </p>
                  <Button asChild>
                    <Link href="/protocols/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Protocol
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {protocols.map((protocol, index) => (
              <motion.div
                key={protocol.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50">
                  <CardHeader>
                    <CardTitle>{protocol.name}</CardTitle>
                    <CardDescription>
                      Protocol ID: {protocol.id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Active Quizzes
                        </div>
                        <div className="text-2xl font-bold">
                          {protocol.totalQuizzes}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Active Hackathons
                        </div>
                        <div className="text-2xl font-bold">
                          {protocol.totalHackathons}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Staff
                        </div>
                        <div className="text-2xl font-bold">
                          {protocol.staffs.length}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/quizzes/new?protocolId=${protocol.id}`}
                        >
                          <Trophy className="mr-2 h-4 w-4" />
                          Quizzes
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/protocols/${protocol.id}/hackathons`}
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          Hackathons
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/protocols/${protocol.id}/staff`}>
                          <Users className="mr-2 h-4 w-4" />
                          Staff
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/protocols/${protocol.id}/settings`}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
