import { Link } from "lucide-react";
import { Card } from "../ui/card";

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

export function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  return (
    <Link href={`/hackathons/${hackathon.id}`}>
      <Card className="group hover-card-animation"></Card>
    </Link>
  );
}
