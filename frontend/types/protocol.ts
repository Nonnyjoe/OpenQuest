export interface UIProtocol {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  created_by: string;
  members: string[];
  staffs: string[];
  quizzes: Quiz[];
  status: "active" | "inactive";
  totalQuizzes: number;
  totalHackathons: number;
  totalRewards: string;
  logo: string;
  website: string;
  tags: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "completed";
  startTime: string;
  duration: number;
  totalParticipants: number;
  reward: string;
}
