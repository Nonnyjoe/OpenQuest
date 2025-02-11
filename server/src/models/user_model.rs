use serde::{Deserialize, Serialize};
// use std::error::Error;
// use sha2::digest::Update;
use sha2::{Digest, Sha256};
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
pub struct SimpleUserStruct {
    pub user_uuid: String,
    pub user_name: String,
    pub email: String,
    pub wallet_address: Option<String>,
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
    pub fn new(user_name: String, email: String, password: String) -> Result<Self, String> {
        let user_uuid = Uuid::new_v4().to_string();
        let wallet = Wallet {
            wallet_address: None,
            updated_at: String::from("0000-00-00 00:00:00"),
        };
        let created_at = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

        let email_struct = Email::new(email)?;
        let password_struct = Password::new(password)?;
        Ok(User {
            user_uuid,
            user_name,
            email: email_struct,
            wallet,
            password: password_struct,
            created_at,
        })
    }

    pub fn display(&self) -> SimpleUserStruct {
        SimpleUserStruct {
            user_uuid: self.user_uuid.clone(),
            user_name: self.user_name.clone(),
            email: self.email.email.clone(),
            wallet_address: self.wallet.wallet_address.clone(),
        }
    }

    pub fn update_email(&mut self, email: String) -> Result<Self, String> {
        self.email.update_email(email);
        return Ok(self.clone());
    }

    pub fn change_password(&mut self, password: String) -> Result<Self, String> {
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        let password_hash = hex::encode(&hasher.finalize());

        self.password.update_password(password_hash);
        return Ok(self.clone());
    }

    pub fn compare_password(&self, password: String) -> bool {
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        let password_hash = hex::encode(&hasher.finalize());

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
    pub fn new(password: String) -> Result<Password, String> {
        let created_at = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        let password_hash = hex::encode(&hasher.finalize());

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

impl Wallet {
    pub fn new(wallet_address: String) -> Wallet {
        let updated_at = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Wallet {
            wallet_address: Some(wallet_address),
            updated_at,
        }
    }

    pub fn update_wallet(&mut self, wallet_address: String) -> bool {
        self.wallet_address = Some(wallet_address);
        self.updated_at = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        return !self.wallet_address.is_none();
    }
}
