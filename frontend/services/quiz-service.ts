import apiClient from "@/lib/api-client";
import { Question, QuizSettings } from "@/types/quiz";

interface QuizOption {
  text: string;
  option_index: "A" | "B" | "C" | "D";
}

interface QuizQuestion {
  id: number;
  question_text: string;
  options: QuizOption[];
  correct_answer: "A" | "B" | "C" | "D";
}

export interface CreateQuizDto {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  protocol: string;
  access: "Public" | "Private";
  total_reward: number;
  max_reward_per_user: number;
  duration_in_sec_timestamp: number;
  start_time: number;
  reward_type: "distributed_by_rank" | "fixed";
  questions: QuizQuestion[];
}

interface PublishQuizDto {
  quizId: string;
}

// Add this mock data
const MOCK_QUIZZES = [
  {
    id: "1",
    name: "Cartesi Experiment Week Quiz",
    description:
      "Test your knowledge about Cartesi's partnership and experiment week",
    difficulty: "Easy",
    protocol: "Cartesi",
    access: "Public",
    total_reward: 100.0,
    max_reward_per_user: 50.0,
    duration_in_sec_timestamp: 1800, // 30 minutes
    start_time: Math.floor(Date.now() / 1000),
    reward_type: "distributed_by_rank",
    questions: [
      {
        id: 1,
        type: "MULTIPLE_CHOICE",
        text: "Which protocol is Cartesi partnering with for this experiment week?",
        options: [
          { id: "1", text: "Eigen Layer", isCorrect: true },
          { id: "2", text: "Ethereum", isCorrect: false },
          { id: "3", text: "Optimism", isCorrect: false },
          { id: "4", text: "Solana", isCorrect: false },
        ],
        points: 10,
      },
      {
        id: 2,
        type: "MULTIPLE_CHOICE",
        text: "What's the duration of the program?",
        options: [
          { id: "A", text: "1 year", isCorrect: false },
          { id: "B", text: "2 weeks", isCorrect: false },
          { id: "C", text: "6 months", isCorrect: false },
          { id: "D", text: "1 week", isCorrect: true },
        ],
        points: 10,
      },
    ],
    status: "active",
    participants: 45,
  },
  {
    id: "2",
    name: "Web3 Gaming Fundamentals",
    description:
      "Test your understanding of Web3 gaming concepts and mechanics",
    difficulty: "Medium",
    protocol: "GameFi",
    access: "Public",
    total_reward: 200.0,
    max_reward_per_user: 75.0,
    duration_in_sec_timestamp: 2400, // 40 minutes
    start_time: Math.floor(Date.now() / 1000),
    reward_type: "fixed",
    questions: [
      {
        id: 1,
        type: "MULTIPLE_CHOICE",
        text: "What is the main advantage of blockchain gaming?",
        options: [
          { id: "A", text: "True ownership of assets", isCorrect: true },
          { id: "B", text: "Better graphics", isCorrect: false },
          { id: "C", text: "Faster gameplay", isCorrect: false },
          { id: "D", text: "Simpler controls", isCorrect: false },
        ],
        points: 10,
      },
      {
        id: 2,
        type: "MULTIPLE_CHOICE",
        text: "Which of these is NOT a common Web3 gaming token type?",
        options: [
          { id: "A", text: "Governance tokens", isCorrect: false },
          { id: "B", text: "Utility tokens", isCorrect: false },
          { id: "C", text: "Experience tokens", isCorrect: true },
          { id: "D", text: "NFTs", isCorrect: false },
        ],
        points: 10,
      },
    ],
    status: "upcoming",
    participants: 0,
  },
];

export const quizService = {
  // Create a new quiz
  async createQuiz(data: CreateQuizDto) {
    try {
      const response = await apiClient.post("/quiz/create", data);
      return response.data;
    } catch (error) {
      console.error("Failed to create quiz:", error);
      throw error;
    }
  },

  // Get quiz by ID
  async getQuiz(id: string) {
    const response = await apiClient.get(`/quizzes/${id}`);
    return response.data;
  },

  // Publish a quiz
  async publishQuiz(data: PublishQuizDto) {
    const response = await apiClient.post(`/quizzes/${data.quizId}/publish`);
    return response.data;
  },

  // Get all quizzes (with optional filters)
  async getQuizzes(params?: { status?: string; difficulty?: string }) {
    const response = await apiClient.get("/quizzes", { params });
    return response.data;
  },

  // Submit quiz answers
  async submitQuizAnswers(quizId: string, answers: any) {
    const response = await apiClient.post(`/quizzes/${quizId}/submit`, {
      answers,
    });
    return response.data;
  },

  async startQuiz(quiz_uuid: string) {
    const response = await apiClient.post("/quiz/join", { quiz_uuid });
    return response.data;
  },

  async healthCheck() {
    const response = await apiClient.get("/health");
    return response.data;
  },

  async getAllQuizzes() {
    const response = await apiClient.get("/quizes");
    return response.data;
  },

  async getQuizById(quizId: string) {
    try {
      // For development, return mock data
      const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
      if (!quiz) throw new Error("Quiz not found");
      return quiz;
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      throw error;
    }
  },

  async getAll() {
    try {
      // For development, return mock data
      return MOCK_QUIZZES;
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
      throw error;
    }
  },
};
