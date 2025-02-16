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
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Calendar,
  Trophy,
  ExternalLink,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { protocolService } from "@/services/protocol-service";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useProtocols } from "@/lib/hooks/use-protocols";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { UIProtocol } from "@/services/protocol-service";

interface Protocol extends UIProtocol {}

// const protocols: Protocol[] = [
//   {
//     id: "1",
//     name: "Ethereum Foundation",
//     description:
//       "Supporting the Ethereum ecosystem through technical grants, community tools, and educational resources.",
//     createdAt: "2024-01-15",
//     members: 250,
//     totalQuizzes: 15,
//     totalHackathons: 3,
//     totalRewards: "50,000 USDC",
//     website: "https://ethereum.foundation",
//     tags: ["Smart Contracts", "DeFi", "Layer 1"],
//     status: "active",
//     logo: "/logos/ethereum-logo.png",
//   },
//   {
//     id: "2",
//     name: "Solana Labs",
//     description:
//       "Advancing blockchain scalability through high-performance protocols and developer tools.",
//     createdAt: "2024-02-01",
//     members: 180,
//     totalQuizzes: 8,
//     totalHackathons: 2,
//     totalRewards: "35,000 USDC",
//     website: "https://solana.com",
//     tags: ["High Performance", "Web3", "Layer 1"],
//     status: "active",
//     logo: "/logos/solanaLogo.png",
//   },
//   {
//     id: "3",
//     name: "Cartesi",
//     description:
//       "Enabling scalable and decentralized computation with Linux-based rollups for blockchain applications.",
//     createdAt: "2024-02-05",
//     members: 120,
//     totalQuizzes: 6,
//     totalHackathons: 3,
//     totalRewards: "25,000 USDC",
//     website: "https://cartesi.io",
//     tags: ["Rollups", "Web3", "Layer 2"],
//     status: "active",
//     logo: "/logos/cartesi-ctsi-logo.png",
//   },
// ];

function ProtocolCard({ protocol }: { protocol: Protocol }) {
  return (
    <Link href={`/protocols/${protocol.id}`}>
      <Card className="group transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              {/* Protocol Logo */}
              <div className="flex-shrink-0">
                <div className="h-12 w-12 overflow-hidden rounded-lg border bg-background group-hover:border-primary/50">
                  {protocol.logo ? (
                    <Building2 className="h-full w-full p-1 text-muted-foreground" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <span className="text-xl font-bold text-muted-foreground">
                        {protocol.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {protocol.name}
                    </h3>
                    <Badge
                      variant={
                        protocol.status === "active" ? "default" : "secondary"
                      }
                      className={
                        protocol.status === "active"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }
                    >
                      {protocol.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    {protocol.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {protocol.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button
              asChild
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span>
                View Details
                <ExternalLink className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{protocol.members} members</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {new Date(protocol.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>{protocol.totalRewards} in rewards</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{protocol.totalQuizzes} quizzes</span>
              <span>•</span>
              <span>{protocol.totalHackathons} hackathons</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ProtocolsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data: protocols, isLoading, error } = useProtocols();
  const [searchResults, setSearchResults] = useState<Protocol[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  console.log("Protocols from query:", protocols);
  console.log("Search results:", searchResults);

  // Ensure we're getting an array
  const displayedProtocols = Array.isArray(searchResults || protocols)
    ? searchResults || protocols
    : [];

  console.log("Final displayed protocols:", displayedProtocols);

  useEffect(() => {
    async function searchProtocols() {
      if (!debouncedSearch) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);
      try {
        const result = await protocolService.getProtocolByName(debouncedSearch);
        setSearchResults(result ? [result] : []);
      } catch (error) {
        console.error("Search failed:", error);
        toast({
          title: "Search Failed",
          description: "Failed to search protocols. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    }

    searchProtocols();
  }, [debouncedSearch]);

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Failed to load protocols</p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Protocols</h1>
          <p className="text-muted-foreground">
            Discover and engage with protocols hosting quizzes and hackathons on
            our platform.
          </p>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search protocols by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Summary */}
        {searchTerm && (
          <p className="text-sm text-muted-foreground">
            Found {displayedProtocols?.length}
            {displayedProtocols?.length === 1 ? "protocol" : "protocols"}
          </p>
        )}

        {isLoading || isSearching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-3">
                <Skeleton className="h-[125px] w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {displayedProtocols?.map((protocol: Protocol) => (
              <motion.div
                key={protocol.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProtocolCard protocol={protocol} />
              </motion.div>
            ))}

            {displayedProtocols?.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No Protocols Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm
                    ? `No protocols found matching "${searchTerm}"`
                    : "No protocols available at the moment."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
