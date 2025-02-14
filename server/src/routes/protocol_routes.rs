use crate::models::protocol_model::Protocol;
use crate::services::{db::Database, quiz_services::createProtocolOnchain};
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

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitRegisterProtocol {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitAddProtocolStaff {
    pub protocol_name: String,
    pub staff_uuid: String,
}

#[post("protocol/register")]
pub async fn register_protocol(
    db: Data<Database>,
    request: Json<SubmitRegisterProtocol>,
    req: HttpRequest,
) -> ApiResponse {
    if let Some(cookie) = req.cookie("token") {
        let jwt_secret = env::var("JWT_SECRET").expect("JWT SECRET IS NOT DEFINED");
        match decode_token(&cookie.value().to_string(), &jwt_secret) {
            Ok(token_data) => {
                if is_valid_token(&token_data.claims) {
                    let existing_protocol = db.get_protocol_via_name(request.name.clone()).await;
                    match existing_protocol {
                        Ok(_) => ApiResponse::new(409, "Protocol already registered".to_string()),
                        Err(e) => match e.error_code {
                            404 => {
                                let mut protocol = Protocol::new(
                                    request.name.clone(),
                                    token_data.claims.user_uuid.clone(),
                                );
                                let result = createProtocolOnchain(
                                    request.name.clone(),
                                    protocol.protocol_uuid.clone(),
                                )
                                .await;
                                if let Ok(address) = result {
                                    protocol.contract_address = address;
                                };
                                match db.create_protocol(protocol.clone()).await {
                                    Ok(_result) => {
                                        return ApiResponse::new(
                                            201,
                                            format!("{:?}", protocol.name),
                                        )
                                    }
                                    Err(err) => {
                                        return ApiResponse::new(err.error_code, err.message)
                                    }
                                }
                            }
                            _ => return ApiResponse::new(e.error_code, e.message),
                        },
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

// Mofify this to ensure only admin can register new users
#[post("protocol/team")]
pub async fn add_protocol_staff(
    db: Data<Database>,
    request: Json<SubmitAddProtocolStaff>,
    req: HttpRequest,
) -> ApiResponse {
    if let Some(cookie) = req.cookie("token") {
        let jwt_secret = env::var("JWT_SECRET").expect("JWT SECRET IS NOT DEFINED");
        match decode_token(&cookie.value().to_string(), &jwt_secret) {
            Ok(token_data) => {
                if is_valid_token(&token_data.claims) {
                    let existing_protocol = db
                        .get_protocol_via_name(request.protocol_name.clone())
                        .await;
                    match existing_protocol {
                        Ok(mut protocol) => {
                            if protocol.staffs.contains(&request.staff_uuid) {
                                return ApiResponse::new(
                                    409,
                                    "User already added to the protocol team".to_string(),
                                );
                            } else {
                                protocol.staffs.push(request.staff_uuid.clone());
                                match db.update_protocol_team(protocol.clone()).await {
                                    Ok(_result) => {
                                        return ApiResponse::new(
                                            200,
                                            format!("{:?}", protocol.name),
                                        )
                                    }
                                    Err(err) => {
                                        return ApiResponse::new(err.error_code, err.message)
                                    }
                                }
                            }
                        }
                        Err(e) => return ApiResponse::new(e.error_code, e.message),
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

#[get("/protocols")]
pub async fn get_all_protocols(db: Data<Database>) -> ApiResponse {
    match db.get_all_protocols().await {
        Ok(users) => ApiResponse::new(200, format!("{:?}", users)),
        Err(e) => ApiResponse::new(e.error_code, e.message),
    }
}
