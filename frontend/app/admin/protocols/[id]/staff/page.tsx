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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  Search,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { protocolService } from "@/services/protocol-service";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";

interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "moderator" | "judge";
  dateAdded: string;
}

const staffFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["admin", "moderator", "judge"], {
    required_error: "Please select a role",
  }),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

const mockStaff: StaffMember[] = [
  {
    id: "1",
    fullName: "John Smith",
    email: "john@protocol.com",
    role: "admin",
    dateAdded: "2024-03-15",
  },
  {
    id: "2",
    fullName: "Sarah Johnson",
    email: "sarah@protocol.com",
    role: "moderator",
    dateAdded: "2024-03-16",
  },
];

export default function ProtocolStaffPage() {
  const params = useParams();
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [protocol, setProtocol] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [protocolData, staffData] = await Promise.all([
          protocolService.getProtocolById(params.id as string),
          protocolService.getProtocolStaff(params.id as string),
        ]);
        setProtocol(protocolData);
        setStaff(staffData);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
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
                <Skeleton key={n} className="h-16 w-full" />
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
            {protocol?.name} Staff
          </h1>
          <p className="text-muted-foreground">
            Manage staff members for {protocol?.name}
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/admin/protocols/${params.id}/staff/invite`)
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>View and manage protocol staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff members..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredStaff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge>{member.role}</Badge>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}

            {filteredStaff.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No staff members found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
