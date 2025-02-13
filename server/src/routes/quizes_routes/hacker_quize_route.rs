use crate::models::quiz_model::{Quiz, QuizAnswer, Status};
use crate::services::db::Database;
use crate::utils::jwt::is_valid_token;
use crate::utils::{api_response::ApiResponse, jwt::decode_token};
use actix_web::{
    cookie::{self, Cookie},
    get, post, put,
    web::{Data, Json},
};
use actix_web::{HttpRequest, HttpResponse};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitStartQuiz {
    pub quiz_uuid: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitSubmitQuiz {
    pub quiz_uuid: String,
    pub answers: Vec<QuizAnswer>,
}

macro_rules! try_or_return {
    ($result:expr) => {
        match $result {
            Ok(value) => value,
            Err(e) => return ApiResponse::new(e.error_code, e.message),
        }
    };
}

#[post("quiz/join")]
pub async fn start_quiz(
    db: Data<Database>,
    request: Json<SubmitStartQuiz>,
    req: HttpRequest,
) -> ApiResponse {
    if let Some(cookie) = req.cookie("token") {
        let jwt_secret = env::var("JWT_SECRET").expect("JWT SECRET IS NOT DEFINED");
        match decode_token(&cookie.value().to_string(), &jwt_secret) {
            Ok(token_data) => {
                if is_valid_token(&token_data.claims) {
                    let quiz =
                        try_or_return!(db.get_quiz_via_uuid(request.quiz_uuid.clone()).await);
                    match quiz.status {
                        Status::Completed => {
                            return ApiResponse::new(
                                400,
                                "Quiz has already been completed".to_string(),
                            );
                        }
                        Status::Pending => {
                            if quiz.start_time <= chrono::Utc::now().timestamp() {
                                if quiz.end_time < chrono::Utc::now().timestamp() {
                                    return ApiResponse::new(
                                        400,
                                        "Submission period exceeded".to_string(),
                                    );
                                }
                                let user = db
                                    .get_user_via_uuid(token_data.claims.user_uuid.clone())
                                    .await
                                    .unwrap();
                                if user.wallet.wallet_address.clone().is_none() {
                                    return ApiResponse::new(
                                        400,
                                        "User does not have a linked wallet address".to_string(),
                                    );
                                }
                                let mut quiz_obj = quiz.clone();
                                quiz_obj.status = Status::Ongoing;
                                quiz_obj.add_participant(
                                    token_data.claims.user_uuid.clone(),
                                    user.wallet.wallet_address.clone().unwrap(),
                                );

                                try_or_return!(db.update_quiz(quiz_obj).await);
                                return ApiResponse::new(
                                    200,
                                    "Quiz started successfully".to_string(),
                                );
                            } else {
                                return ApiResponse::new(
                                    400,
                                    "Quiz is currently pending".to_string(),
                                );
                            }
                        }
                        Status::Canceled => {
                            return ApiResponse::new(
                                400,
                                "Quiz has already been Canceled".to_string(),
                            );
                        }
                        Status::Ongoing => {
                            let user = db
                                .get_user_via_uuid(token_data.claims.user_uuid.clone())
                                .await
                                .unwrap();
                            if user.wallet.wallet_address.clone().is_none() {
                                return ApiResponse::new(
                                    400,
                                    "User does not have a linked wallet address".to_string(),
                                );
                            }
                            let mut quiz_obj = quiz.clone();

                            quiz_obj.add_participant(
                                token_data.claims.user_uuid.clone(),
                                user.wallet.wallet_address.clone().unwrap(),
                            );
                            try_or_return!(db.update_quiz(quiz_obj).await);
                            return ApiResponse::new(200, "Quiz started successfully".to_string());
                        }
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

#[post("quize/submit")]
pub async fn submit_quiz(
    db: Data<Database>,
    request: Json<SubmitSubmitQuiz>,
    req: HttpRequest,
) -> ApiResponse {
    if let Some(cookie) = req.cookie("token") {
        let jwt_secret = env::var("JWT_SECRET").expect("JWT SECRET IS NOT DEFINED");
        match decode_token(&cookie.value().to_string(), &jwt_secret) {
            Ok(token_data) => {
                if is_valid_token(&token_data.claims) {
                    let mut quiz =
                        try_or_return!(db.get_quiz_via_uuid(request.quiz_uuid.clone()).await);
                    match quiz.status {
                        Status::Completed => {
                            return ApiResponse::new(
                                400,
                                "Quiz has already been completed".to_string(),
                            );
                        }
                        Status::Pending => {
                            return ApiResponse::new(400, "Quiz is currently pending".to_string());
                        }
                        Status::Canceled => {
                            return ApiResponse::new(
                                400,
                                "Quiz has already been Canceled".to_string(),
                            );
                        }
                        Status::Ongoing => {
                            // if let Some(&participant) == quiz.participants.iter().find(|p| p.user_uuid == token_data.claims.user_uuid) {}
                            if let Some(participant) = quiz
                                .participants
                                .iter_mut()
                                .find(|p| p.user_uuid == token_data.claims.user_uuid)
                            {
                                participant.submit_quiz(request.answers.clone());
                                try_or_return!(db.update_quiz(quiz).await);
                                return ApiResponse::new(
                                    200,
                                    "Quiz submitted successfully".to_string(),
                                );
                            } else {
                                ApiResponse::new(404, format!("Not a registered quiz participant"))
                            }
                        }
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
