"use client";

import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ReminderButtonProps {
  quizId: string;
  isReminded?: boolean;
}

export function ReminderButton({
  quizId,
  isReminded = false,
}: ReminderButtonProps) {
  const [hasReminder, setHasReminder] = useState(isReminded);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleReminder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quizzes/${quizId}/reminder`, {
        method: hasReminder ? "DELETE" : "POST",
      });

      if (!response.ok) throw new Error("Failed to update reminder");

      setHasReminder(!hasReminder);
      toast({
        title: hasReminder ? "Reminder removed" : "Reminder set",
        description: hasReminder
          ? "You will no longer be notified when this quiz opens"
          : "You will be notified when this quiz opens",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleReminder}
      disabled={isLoading}
      className={hasReminder ? "text-primary" : "text-muted-foreground"}
    >
      {hasReminder ? (
        <BellRing className="mr-2 h-4 w-4" />
      ) : (
        <Bell className="mr-2 h-4 w-4" />
      )}
      {hasReminder ? "Reminder set" : "Set reminder"}
    </Button>
  );
}
