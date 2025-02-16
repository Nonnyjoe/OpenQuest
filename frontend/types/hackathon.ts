export enum HackathonStatus {
  DRAFT = "draft",
  UPCOMING = "upcoming",
  ACTIVE = "active",
  JUDGING = "judging",
  COMPLETED = "completed",
}

export enum ProjectTrack {
  DEFI = "defi",
  NFT = "nft",
  GAMING = "gaming",
  INFRASTRUCTURE = "infrastructure",
  SOCIAL = "social",
  DAO = "dao",
  OTHER = "other",
}

export interface HackathonPrize {
  id: string;
  track: ProjectTrack;
  title: string;
  description: string;
  amount: number;
  sponsor?: string;
}

export interface JudgingCriteria {
  id: string;
  title: string;
  description: string;
  weight: number; // Percentage weight in final score
}

export interface TimelineMilestone {
  id: string;
  title: string;
  date: Date;
  description?: string;
}

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  status: HackathonStatus;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  submissionDeadline: Date;
  judgingPeriod: {
    start: Date;
    end: Date;
  };
  prizes: HackathonPrize[];
  tracks: ProjectTrack[];
  judgingCriteria: JudgingCriteria[];
  timeline: TimelineMilestone[];
  rules: string[];
  requirements: string[];
  resources: {
    id: string;
    title: string;
    url: string;
    type: "documentation" | "tutorial" | "github" | "other";
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
  maxTeamSize: number;
  minTeamSize: number;
  totalPrizePool: number;
  featuredImage?: string;
  bannerImage?: string;
}
