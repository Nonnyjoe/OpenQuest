"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, Share2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ShareQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
}

export function ShareQuizDialog({
  isOpen,
  onClose,
  quizId,
  quizTitle,
}: ShareQuizDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate the quiz URL
  const quizUrl = `${window.location.origin}/quiz/${quizId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(quizUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Quiz link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById("quiz-qr-code") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quizTitle.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR Code Downloaded",
        description: "The QR code has been downloaded successfully.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Quiz</DialogTitle>
          <DialogDescription>
            Share this quiz with participants using the link or QR code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quiz Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quiz Link</label>
            <div className="flex gap-2">
              <Input value={quizUrl} readOnly />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-4">
            <label className="text-sm font-medium">QR Code</label>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg border bg-white p-4">
                <QRCodeSVG
                  id="quiz-qr-code"
                  value={quizUrl}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownloadQR}
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
