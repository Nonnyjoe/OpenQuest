import { Link } from "lucide-react";
import { Card } from "../ui/card";
import { CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ExternalLink } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  startDate: string;
  duration: string;
  difficulty: string;
  participants: number;
  reward: string;
  status: "upcoming" | "active" | "completed";
}

export function QuizCard({ quiz }: { quiz: Quiz }) {
  return (
    <Link href={`/quizzes/${quiz.id}`}>
      <Card className="group hover-card-animation">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium hover-card-title">
                    {quiz.title}
                  </h3>
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
  );
}
