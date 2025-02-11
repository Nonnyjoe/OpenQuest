use crate::models::user_model::User;
use dotenv::dotenv;
use futures::TryStreamExt;
use mongodb::bson::from_document;
use mongodb::error::Error;
use mongodb::{
    bson::doc,
    options::IndexOptions,
    results::{DeleteResult, InsertOneResult, UpdateResult},
    Client, Collection, IndexModel,
};
use std::env;
use std::result;

#[derive(Debug, Clone)]
pub struct Database {
    users: Collection<User>,
    // networks: Collection<NetworkManager>,
}

#[derive(Debug)]
pub struct DatabaseResponse {
    pub error_code: u16,
    pub message: String,
}

impl DatabaseResponse {
    pub fn new(error_code: u16, message: String) -> Self {
        DatabaseResponse {
            error_code,
            message,
        }
    }
}

macro_rules! try_or_return_string {
    ($result:expr) => {
        match $result {
            Ok(value) => value,
            Err(e) => return Err(DatabaseResponse::new(500, e.to_string())),
        }
    };
}

impl Database {
    pub async fn init() -> Self {
        dotenv().ok();
        let db_url = env::var("DB_URL").expect("DB_URL must be set");

        let client = Client::with_uri_str(db_url)
            .await
            .expect("failed to connect");
        let db = client.database("OpenQuest");

        let users = db.collection("users");
        println!("DATABASE CONNECTION SUCCESSFUL!!!!");
        return Database { users };
    }

    pub async fn create_user(&self, user: User) -> Result<InsertOneResult, DatabaseResponse> {
        match self.users.insert_one(user).await {
            Ok(result) => Ok(result),
            Err(e) => Err(DatabaseResponse::new(
                500,
                format!("{}, {}", "Error creating user", e),
            )),
        }
    }

    pub async fn get_all_users(&self) -> Result<Vec<User>, DatabaseResponse> {
        let result = self.users.find(doc! {}).await;

        match result {
            Ok(mut cursor) => {
                let mut users: Vec<User> = Vec::new();
                while let Ok(Some(user)) = cursor.try_next().await {
                    users.push(user);
                }
                if users.is_empty() {
                    return Err(DatabaseResponse::new(
                        404,
                        "No users were found".to_string(),
                    ));
                }
                Ok(users)
            }
            Err(e) => Err(DatabaseResponse::new(
                500,
                format!("{}, {}", "Error retrieving users", e),
            )),
        }
    }

    pub async fn get_user_via_email(&self, email: String) -> Result<User, DatabaseResponse> {
        let result = self.users.find_one(doc! {"email.email": email}).await;

        match result {
            Ok(Some(user)) => Ok(user),
            Ok(None) => Err(DatabaseResponse::new(404, "User not found".to_string())),
            Err(e) => Err(DatabaseResponse::new(500, format!("Database error: {}", e))),
        }
    }

    pub async fn get_user_via_uuid(&self, uuid: String) -> Result<User, DatabaseResponse> {
        let result = self.users.find_one(doc! {"user_uuid": uuid}).await;

        match result {
            Ok(Some(user)) => Ok(user),
            Ok(None) => Err(DatabaseResponse::new(404, "User not found".to_string())),
            Err(e) => Err(DatabaseResponse::new(500, format!("Database error: {}", e))),
        }
    }
}
