use crate::models::user_model::User;
use crate::services::db::Database;
use crate::utils::api_response::ApiResponse;
use actix_web::{get, post, web::Data, web::Json};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitRegisterUser {
    pub username: String,
    pub password_hash: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitLinkWalletAddress {
    pub user_uuid: String,
    pub wallet_address: String,
}

#[post("/user/register")]
pub async fn register_user(db: Data<Database>, request: Json<SubmitRegisterUser>) -> ApiResponse {
    let existing_user = db.get_user_via_email(request.email.clone()).await;
    match existing_user {
        Ok(_) => ApiResponse::new(409, "Email already registered".to_string()),
        Err(e) => match e.error_code {
            404 => {
                let user = User::new(
                    request.username.clone(),
                    request.email.clone(),
                    request.password_hash.clone(),
                );
                match user {
                    Ok(user_struct) => match db.create_user(user_struct.clone()).await {
                        Ok(_result) => {
                            ApiResponse::new(201, format!("{:?}", user_struct.user_uuid))
                        }
                        Err(err) => ApiResponse::new(err.error_code, err.message),
                    },
                    Err(err) => ApiResponse::new(400, err),
                }
            }
            _ => ApiResponse::new(e.error_code, e.message),
        },
    }
}

#[get("/users")]
pub async fn get_all_users(db: Data<Database>) -> ApiResponse {
    match db.get_all_users().await {
        Ok(users) => ApiResponse::new(200, format!("{:?}", users)),
        Err(e) => ApiResponse::new(e.error_code, e.message),
    }
}
#[post("/user/wallet")]
pub async fn link_wallet_address(
    db: Data<Database>,
    request: Json<SubmitLinkWalletAddress>,
) -> ApiResponse {
    // TODO: Implement wallet linking logic here
    ApiResponse::new(
        200,
        format!("Wallet linked for user: {}", request.wallet_address),
    )
}
