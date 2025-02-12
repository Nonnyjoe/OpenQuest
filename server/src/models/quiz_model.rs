use chrono::{DateTime, Duration, Utc};
// use mongodb::bson::Uuid;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum QuizAccess {
    Public,
    Private,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum DifficultyLevel {
    Easy,
    Medium,
    Hard,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Status {
    Pending,
    Ongoing,
    Completed,
    Canceled,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum OptionIndex {
    A,
    B,
    C,
    D,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Question {
    pub id: usize, // Question index
    pub question_text: String,
    pub options: [QuizOption; 4],    // Options A-D
    pub correct_answer: OptionIndex, // 'A', 'B', 'C', or 'D'
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QuizOption {
    pub text: String,
    pub option_index: OptionIndex,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QuizAnswer {
    pub question_id: usize,
    pub answer: OptionIndex,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Participant {
    pub user_uuid: String,
    pub score: i64,
    pub answered_questions: Vec<QuizAnswer>, // Question index and answer index
    pub submission_time: i64,
    pub start_time: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Quiz {
    pub uuid: String,
    pub name: String,
    pub difficulty: DifficultyLevel,
    pub protocol: String,
    pub description: String,
    pub num_questions: usize,
    pub questions: Vec<Question>,
    pub access: QuizAccess,
    pub total_reward: f64,
    pub max_reward_per_user: f64,
    pub duration_in_minutes: i64,
    pub start_time: i64,
    pub end_time: i64,
    pub created_at: i64,
    pub created_by: String,
    pub participants: Vec<Participant>,
    pub status: Status,
}

impl Quiz {
    /// Create a new quiz instance
    pub fn new(
        name: String,
        difficulty: DifficultyLevel,
        description: String,
        protocol: String,
        created_by: String,
        questions: Vec<Question>,
        access: QuizAccess,
        total_reward: f64,
        max_reward_per_user: f64,
        duration_in_minutes: i64,
        start_time: i64,
    ) -> Self {
        Self {
            uuid: Uuid::new_v4().to_string(),
            name,
            difficulty,
            description,
            num_questions: questions.len(),
            protocol,
            created_by,
            questions,
            access,
            total_reward,
            max_reward_per_user,
            duration_in_minutes,
            start_time,
            end_time: start_time + duration_in_minutes,
            created_at: Utc::now().timestamp(),
            participants: Vec::new(),
            status: Status::Pending,
        }
    }

    pub fn add_participant(&mut self, uuid: String) -> bool {
        self.participants.push(Participant {
            user_uuid: uuid,
            score: 0,
            answered_questions: Vec::new(),
            submission_time: 0,
            start_time: Utc::now().timestamp(),
        });
        return true;
    }

    /// Check if the quiz is currently active
    pub fn is_active(&self) -> bool {
        let now = Utc::now().timestamp();
        now >= self.start_time && now <= self.end_time
    }

    /// Get the remaining time for the quiz
    pub fn remaining_time(&self) -> Option<i64> {
        let now = Utc::now().timestamp();
        if now > self.end_time {
            return None;
        } else {
            return Some(self.end_time - now);
        }
    }

    /// Validate that the quiz structure is correct
    pub fn validate(&self) -> Result<(), String> {
        if self.num_questions == 0 {
            return Err("Quiz must have at least one question.".to_string());
        }

        if self.total_reward < self.max_reward_per_user {
            return Err("Total reward cannot be less than max reward per user.".to_string());
        }

        for (index, question) in self.questions.iter().enumerate() {
            if question.options.len() != 4 {
                return Err(format!(
                    "Question {} must have exactly 4 options.",
                    index + 1
                ));
            }
        }

        Ok(())
    }
}

impl QuizAccess {
    pub fn to_string(&self) -> &'static str {
        match self {
            QuizAccess::Public => "Public",
            QuizAccess::Private => "Private",
        }
    }

    pub fn from_str(value: &str) -> Option<QuizAccess> {
        match value {
            "Public" => Some(QuizAccess::Public),
            "Private" => Some(QuizAccess::Private),
            _ => None,
        }
    }
}

impl DifficultyLevel {
    pub fn to_string(&self) -> &'static str {
        match self {
            DifficultyLevel::Easy => "Easy",
            DifficultyLevel::Medium => "Medium",
            DifficultyLevel::Hard => "Hard",
        }
    }
    pub fn from_str(value: &str) -> Option<DifficultyLevel> {
        match value {
            "Easy" => Some(DifficultyLevel::Easy),
            "Medium" => Some(DifficultyLevel::Medium),
            "Hard" => Some(DifficultyLevel::Hard),
            _ => None,
        }
    }
}

impl OptionIndex {
    pub fn to_string(&self) -> &'static str {
        match self {
            OptionIndex::A => "A",
            OptionIndex::B => "B",
            OptionIndex::C => "C",
            OptionIndex::D => "D",
        }
    }

    pub fn from_str(value: &str) -> Option<OptionIndex> {
        match value {
            "A" => Some(OptionIndex::A),
            "B" => Some(OptionIndex::B),
            "C" => Some(OptionIndex::C),
            "D" => Some(OptionIndex::D),
            _ => None,
        }
    }
}

impl Participant {
    pub fn submit_quiz(&mut self, answered_questions: Vec<QuizAnswer>) -> bool {
        self.answered_questions = answered_questions;
        self.submission_time = Utc::now().timestamp();
        return true;
    }
}
