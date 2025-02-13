use crate::models::protocol_model::Protocol;
use crate::models::quiz_model::{DifficultyLevel, Question, Quiz, QuizAccess, RewardType};
use crate::services::db::Database;
use crate::utils::jwt::is_valid_token;
use crate::utils::{api_response::ApiResponse, jwt::decode_token};
use actix_web::{
    cookie::{self, Cookie},
    get, post,
    web::{Data, Json},
};
use actix_web::{HttpRequest, HttpResponse};
use serde::{Deserialize, Serialize};
use std::env;

macro_rules! try_or_return {
    ($result:expr) => {
        match $result {
            Ok(value) => value,
            Err(e) => return ApiResponse::new(e.error_code, e.message),
        }
    };
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitCreateQuiz {
    name: String,
    difficulty: String,
    description: String,
    protocol: String,
    questions: Vec<Question>,
    access: String,
    total_reward: f64,
    max_reward_per_user: f64,
    duration_in_sec_timestamp: i64,
    start_time: i64,
    reward_type: String,
}

#[post("quiz/create")]
pub async fn create_quiz(
    db: Data<Database>,
    request: Json<SubmitCreateQuiz>,
    req: HttpRequest,
) -> ApiResponse {
    if let Some(cookie) = req.cookie("token") {
        let jwt_secret = env::var("JWT_SECRET").expect("JWT SECRET IS NOT DEFINED");
        match decode_token(&cookie.value().to_string(), &jwt_secret) {
            Ok(token_data) => {
                if is_valid_token(&token_data.claims) {
                    let new_quiz = Quiz::new(
                        request.name.clone(),
                        DifficultyLevel::from_str(&request.difficulty.clone()).unwrap(),
                        request.description.clone(),
                        request.protocol.clone(),
                        token_data.claims.user_uuid.clone(),
                        request.questions.clone(),
                        QuizAccess::from_str(&request.access.clone()).unwrap(),
                        request.total_reward.clone(),
                        request.max_reward_per_user.clone(),
                        request.duration_in_sec_timestamp.clone(),
                        request.start_time.clone(),
                        RewardType::from_str(request.reward_type.clone().as_str()).unwrap(),
                    );
                    match db.add_quiz(new_quiz.clone()).await {
                        Ok(_) => {
                            let mut protocol = try_or_return!(
                                db.get_protocol_via_name(request.protocol.clone()).await
                            );
                            protocol.update_total_expense(request.total_reward.clone());
                            protocol.add_quiz(new_quiz.uuid.clone());
                            match db.update_protocol(protocol.clone()).await {
                                Ok(_result) => {
                                    return ApiResponse::new(201, format!("{:?}", new_quiz.uuid));
                                }
                                Err(e) => ApiResponse::new(e.error_code, e.message),
                            };
                            ApiResponse::new(201, format!("{:?}", new_quiz.uuid))
                        }
                        Err(e) => ApiResponse::new(e.error_code, e.message),
                    }
                } else {
                    return ApiResponse::new(401, "Invalid or expired token".to_string());
                }
            }
            Err(_) => return ApiResponse::new(401, "Invalid token".to_string()),
        }
    } else {
        return ApiResponse::new(401, "Missing token".to_string());
    }
}

// pub async fn create_quiz(
//     db: Data<Database>,
//     request: Json<SubmitCreateQuiz>,
//     req: HttpRequest,
// ) -> ApiResponse {
//     if let Some(cookie) = req.cookie("token") {
//         let jwt_secret = env::var("JWT_SECRET").expect("JWT SECRET IS NOT DEFINED");
//         match decode_token(&cookie.value().to_string(), &jwt_secret) {
//             Ok(token_data) => {
//                 if is_valid_token(&token_data.claims) {

//                 } else {
//                     return ApiResponse::new(401, "Invalid or expired token".to_string());
//                 }
//             }
//             Err(_) => return ApiResponse::new(401, "Invalid token".to_string()),
//         }
//     } else {
//         return ApiResponse::new(401, "Missing token".to_string());
//     }
// }
