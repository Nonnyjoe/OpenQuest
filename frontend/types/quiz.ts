export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  SINGLE_CHOICE = "SINGLE_CHOICE",
  TRUE_FALSE = "true_false",
  SHORT_ANSWER = "short_answer",
  FILL_BLANK = "fill_blank",
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizSettings {
  duration_in_sec_timestamp: number;
  totalPoints: number;
  passingScore: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  points: number;
  explanation?: string;
  correctAnswer?: string; // For short answer/fill in blank
  order?: number; // For randomization tracking
}
