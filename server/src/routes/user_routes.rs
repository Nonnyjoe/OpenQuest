use crate::services::db::Database;
use crate::utils::api_response::ApiResponse;
use crate::{models::user_model::User, utils::jwt::generate_jwt};
use actix_web::cookie::time::Duration;
use actix_web::cookie::SameSite;
use actix_web::http::StatusCode;
use actix_web::HttpResponse;
use actix_web::{
    cookie::Cookie,
    get, post,
    web::Path,
    web::{Data, Json},
};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitRegisterUser {
    pub username: String,
    pub password: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitLinkWalletAddress {
    pub user_uuid: String,
    pub wallet_address: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitLogin {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Clone, Deserialize)]
pub struct SubmitGetProfileViaEmail {
    pub email: String,
}

macro_rules! try_or_return_string {
    ($result:expr) => {
        match $result {
            Ok(value) => value,
            Err(e) => return Err(DatabaseResponse::new(500, e.to_string())),
        }
    };
}

macro_rules! try_or_return {
    ($result:expr) => {
        match $result {
            Ok(value) => value,
            Err(e) => return ApiResponse::new(e.error_code, e.message),
        }
    };
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
                    request.password.clone(),
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
    let existing_user = db.get_user_via_uuid(request.user_uuid.clone()).await;
    match existing_user {
        Ok(mut user) => {
            user.wallet.update_wallet(request.wallet_address.clone());
            match db
                .update_user_wallet(request.user_uuid.clone(), user.wallet.clone())
                .await
            {
                Ok(_result) => {
                    return ApiResponse::new(200, format!("{:?}", user.clone().display()))
                }
                Err(err) => return ApiResponse::new(err.error_code, err.message),
            }
        }
        Err(e) => return ApiResponse::new(e.error_code, e.message),
    }
}

#[post("/user/login")]
pub async fn login_user(db: Data<Database>, request: Json<SubmitLogin>) -> HttpResponse {
    let jwt_secret = env::var("JWT_SECRET").expect("JWT SECRET IS NOT DEFINED");
    let existing_user = db.get_user_via_email(request.email.clone()).await;
    match existing_user {
        Ok(user) => {
            println!("User Found!!!!");
            if user.compare_password(request.password.clone()) {
                let cookie = Cookie::build(
                    "token",
                    generate_jwt(user.user_uuid.clone(), jwt_secret).unwrap(),
                )
                .path("/")
                .max_age(Duration::seconds(3600))
                .same_site(SameSite::None)
                .http_only(true)
                .finish();
                return HttpResponse::Ok().cookie(cookie).finish();
            } else {
                return HttpResponse::Unauthorized().body("Invalid username or password");
            }
        }
        Err(e) => return HttpResponse::InternalServerError().body(e.message),
    }
}

#[get("/user/by-email/{email}")]
pub async fn get_user_via_email(
    db: Data<Database>,
    request: Path<SubmitGetProfileViaEmail>,
) -> ApiResponse {
    let email_address = request.into_inner().email;

    let user: User = try_or_return!(db.get_user_via_email(email_address).await);
    return ApiResponse::new(200, format!("{:?}", user));
}

#[get("/user/by-id/{user_id}")]
pub async fn get_user_by_id(db: Data<Database>, path: Path<String>) -> ApiResponse {
    let user_id = path.into_inner();
    let user: User = try_or_return!(db.get_user_via_uuid(user_id.clone()).await);
    ApiResponse::new(200, format!("{:?}", user))
}
