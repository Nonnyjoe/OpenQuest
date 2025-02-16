"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Import, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Question, QuestionType } from "@/types/quiz";

interface QuizImportExportProps {
  questions: Question[];
  onImport: (questions: Question[]) => void;
}

export function QuizImportExport({
  questions,
  onImport,
}: QuizImportExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    const data = JSON.stringify(questions, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-questions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedQuestions = JSON.parse(content);

        if (!Array.isArray(importedQuestions)) {
          throw new Error("Invalid format: Expected an array of questions");
        }

        const questionsWithIds = importedQuestions.map((q) => ({
          ...q,
          id: q.id || crypto.randomUUID(),
          type: q.type as QuestionType,
          options:
            q.options?.map((o: any) => ({
              ...o,
              id: o.id || crypto.randomUUID(),
            })) || [],
        })) as Question[];

        onImport(questionsWithIds);
        setIsOpen(false);
        toast({
          title: "Questions Imported",
          description: `Successfully imported ${questionsWithIds.length} questions`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description:
            "Failed to import questions. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export Questions
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Import className="mr-2 h-4 w-4" />
            Import Questions
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Questions</DialogTitle>
            <DialogDescription>
              Import questions from a JSON file
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="cursor-pointer"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
