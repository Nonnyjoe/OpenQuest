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
import { hackathonService } from "@/services/hackathon-service";
export default function ProtocolHackathonsPage() {
  const params = useParams();
  const router = useRouter();
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [protocol, setProtocol] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [protocolData, hackathonsData] = await Promise.all([
          protocolService.getProtocolById(params.id as string),
          hackathonService.getHackathonsByProtocol(params.id as string),
        ]);
        setProtocol(protocolData);
        setHackathons(hackathonsData);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const filteredHackathons = hackathons.filter((hackathon) =>
    hackathon.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-[300px] mb-4" />
        <Skeleton className="h-4 w-[200px] mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {protocol?.name} Hackathons
          </h1>
          <p className="text-muted-foreground">
            Manage hackathons for {protocol?.name}
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/admin/hackathons/new?protocolId=${params.id}`)
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Create Hackathon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hackathons</CardTitle>
          <CardDescription>View and manage all hackathons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search hackathons..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredHackathons.map((hackathon) => (
              <Card
                key={hackathon.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{hackathon.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {hackathon.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/hackathons/${hackathon.id}`)
                      }
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredHackathons.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No hackathons found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
