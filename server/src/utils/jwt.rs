use actix_web::cookie::Cookie;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub exp: i64,
    pub user_uuid: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CookieError {
    pub error_code: i64,
    pub message: String,
}

pub fn generate_jwt(
    user_uuid: String,
    jwt_secret: String,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = chrono::Utc::now().timestamp();
    let expiration_time = now + 60 * 60 * 24; // 24 hours

    let claims = Claims {
        exp: expiration_time,
        user_uuid: user_uuid,
    };

    return encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    );
}

pub fn decode_token(
    token: &String,
    jwt_secret: &String,
) -> Result<TokenData<Claims>, jsonwebtoken::errors::Error> {
    return decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &Validation::default(),
    );
}

pub fn is_valid_token(claim: &Claims) -> bool {
    return claim.exp > chrono::Utc::now().timestamp();
}

pub fn verify_cookie(cookie: Option<Cookie>) -> Result<String, CookieError> {
    if let Some(cookie) = cookie {
        let cookie_value = cookie.value().to_string();
        let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET not set");

        match decode_token(&cookie_value, &jwt_secret) {
            Ok(token_data) => {
                if is_valid_token(&token_data.claims) {
                    return Ok(token_data.claims.user_uuid);
                } else {
                    return Err(CookieError {
                        error_code: 401,
                        message: "Invalid or expired token".to_string(),
                    });
                }
            }
            Err(_) => {
                return Err(CookieError {
                    error_code: 401,
                    message: "Invalid token".to_string(),
                });
            }
        }
    } else {
        return Err(CookieError {
            error_code: 401,
            message: "Missing token".to_string(),
        });
    }
}
