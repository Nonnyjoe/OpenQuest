import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReminderButton } from "./reminder-button";

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  isOpen: boolean;
  hasReminder?: boolean;
}

export function QuizCard({
  id,
  title,
  description,
  startDate,
  isOpen,
  hasReminder = false,
}: QuizCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <Badge variant={isOpen ? "default" : "secondary"}>
          {isOpen ? "Open" : "Upcoming"}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {isOpen ? (
              <span className="text-green-600 dark:text-green-400">
                Available now
              </span>
            ) : (
              <span>Opens {startDate.toLocaleDateString()}</span>
            )}
          </div>
          {!isOpen && <ReminderButton quizId={id} isReminded={hasReminder} />}
        </div>
      </CardContent>
    </Card>
  );
}
