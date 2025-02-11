use serde::{Deserialize, Serialize};
// use std::error::Error;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct User {
    pub user_uuid: String,
    pub user_name: String,
    pub email: Email,
    pub wallet: Wallet,
    pub password: Password,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Wallet {
    pub wallet_address: Option<String>,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Password {
    pub password_hash: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Email {
    pub email: String,
    pub verified: bool,
    pub updated_at: String,
}

impl User {
    pub fn new(user_name: String, email: String, password_hash: String) -> Result<Self, String> {
        let user_uuid = Uuid::new_v4().to_string();
        let wallet = Wallet {
            wallet_address: None,
            updated_at: String::from("0000-00-00 00:00:00"),
        };
        let created_at = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

        let email_struct = Email::new(email)?;
        let password_struct = Password::new(password_hash)?;
        Ok(User {
            user_uuid,
            user_name,
            email: email_struct,
            wallet,
            password: password_struct,
            created_at,
        })
    }

    pub fn update_email(&mut self, email: String) -> Result<Self, String> {
        self.email.update_email(email);
        return Ok(self.clone());
    }

    pub fn change_password(&mut self, password_hash: String) -> Result<Self, String> {
        self.password.update_password(password_hash);
        return Ok(self.clone());
    }

    pub fn compare_password(&self, password_hash: String) -> bool {
        if self.password.password_hash == password_hash {
            return true;
        }
        return false;
    }
}

impl Email {
    pub fn new(email: String) -> Result<Email, String> {
        let created_at = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let email_obj = Email {
            email,
            verified: false,
            updated_at: created_at,
        };
        return Ok(email_obj);
    }

    pub fn verify(&mut self) -> Result<bool, String> {
        self.verified = true;
        return Ok(self.verified);
    }

    pub fn get_email(&self) -> &str {
        &self.email
    }

    pub fn get_verified(&self) -> bool {
        self.verified
    }

    pub fn update_email(&mut self, email: String) -> bool {
        self.email = email;
        self.verified = false;
        return !self.verified;
    }
}

impl Password {
    pub fn new(password_hash: String) -> Result<Password, String> {
        let created_at = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let password_obj = Password {
            password_hash,
            updated_at: created_at,
        };
        return Ok(password_obj);
    }

    pub fn get_password_hash(&self) -> &str {
        &self.password_hash
    }

    pub fn update_password(&mut self, password_hash: String) -> bool {
        self.password_hash = password_hash;
        self.updated_at = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        return !self.password_hash.is_empty();
    }
}
