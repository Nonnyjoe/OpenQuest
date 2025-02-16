"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareQuizDialog } from "./share-quiz-dialog";

interface PublishQuizButtonProps {
  quizId: string;
  quizTitle: string;
  isPublished: boolean;
  onPublish?: () => Promise<void>;
}

export function PublishQuizButton({
  quizId,
  quizTitle,
  isPublished,
  onPublish,
}: PublishQuizButtonProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handlePublishClick = async () => {
    if (onPublish) {
      await onPublish();
    }
    setIsShareOpen(true);
  };

  return (
    <>
      <Button onClick={handlePublishClick} disabled={isPublished}>
        {isPublished ? "Published" : "Publish Quiz"}
      </Button>

      <ShareQuizDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        quizId={quizId}
        quizTitle={quizTitle}
      />
    </>
  );
}
