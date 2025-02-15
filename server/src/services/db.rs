use crate::models::protocol_model::Protocol;
use crate::models::quiz_model::{Participant, Quiz};
use crate::models::user_model::{SimpleUserStruct, User, Wallet};
use dotenv::dotenv;
use futures::{StreamExt, TryStreamExt};
use mongodb::bson::from_document;
use mongodb::error::Error;
use mongodb::{
    bson::doc,
    bson::{to_bson, Bson},
    options::IndexOptions,
    results::{DeleteResult, InsertOneResult, UpdateResult},
    Client, Collection, IndexModel,
};
use std::env;
use std::result;

#[derive(Debug, Clone)]
pub struct Database {
    users: Collection<User>,
    protocols: Collection<Protocol>,
    quizes: Collection<Quiz>,
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
        let protocols = db.collection("protocols");
        let quizes = db.collection("quizes");
        println!("DATABASE CONNECTION SUCCESSFUL!!!!");
        return Database {
            users,
            protocols,
            quizes,
        };
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

    pub async fn get_all_users(&self) -> Result<Vec<SimpleUserStruct>, DatabaseResponse> {
        let result = self.users.find(doc! {}).await;

        match result {
            Ok(mut cursor) => {
                let mut users: Vec<SimpleUserStruct> = Vec::new();
                while let Ok(Some(user)) = cursor.try_next().await {
                    users.push(user.display());
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

    pub async fn get_user_via_address(&self, address: String) -> Result<User, DatabaseResponse> {
        let filter = doc! {
            "wallet.wallet_address": {
                "$regex": format!("^{}$", address),
                "$options": "i"  // Case-insensitive option
            }
        };

        let mut cursor = match self.users.find(filter).await {
            Ok(cursor) => cursor,
            Err(e) => return Err(DatabaseResponse::new(500, format!("Database error: {}", e))),
        };

        if let Some(result) = cursor.next().await {
            match result {
                Ok(user) => Ok(user),
                Err(e) => Err(DatabaseResponse::new(
                    500,
                    format!("Error parsing user data: {}", e),
                )),
            }
        } else {
            Err(DatabaseResponse::new(404, "User not found".to_string()))
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

    pub async fn update_user_wallet(
        &self,
        uuid: String,
        wallet_struct: Wallet,
    ) -> Result<UpdateResult, DatabaseResponse> {
        let wallet_bson =
            to_bson(&wallet_struct).map_err(|e| DatabaseResponse::new(500, e.to_string()))?;
        let result = try_or_return_string!(
            self.users
                .update_one(
                    doc! {"user_uuid": uuid},
                    doc! {"$set": doc! {"wallet": wallet_bson}},
                )
                .await
        );
        Ok(result)
    }

    pub async fn get_protocol_via_name(&self, name: String) -> Result<Protocol, DatabaseResponse> {
        let result = self.protocols.find_one(doc! {"name": name}).await;

        match result {
            Ok(Some(protocol)) => Ok(protocol),
            Ok(None) => Err(DatabaseResponse::new(404, "Protocol not found".to_string())),
            Err(e) => Err(DatabaseResponse::new(500, format!("Database error: {}", e))),
        }
    }

    pub async fn create_protocol(
        &self,
        protocol: Protocol,
    ) -> Result<InsertOneResult, DatabaseResponse> {
        match self.protocols.insert_one(protocol).await {
            Ok(result) => Ok(result),
            Err(e) => Err(DatabaseResponse::new(
                500,
                format!("{}, {}", "Error creating protocol", e),
            )),
        }
    }

    pub async fn update_protocol_team(
        &self,
        protocol: Protocol,
    ) -> Result<UpdateResult, DatabaseResponse> {
        let staffs_bson =
            to_bson(&protocol.staffs).map_err(|e| DatabaseResponse::new(500, e.to_string()))?;
        let result = try_or_return_string!(
            self.protocols
                .update_one(
                    doc! {"name": protocol.name},
                    doc! {"$set": doc! {"staffs": staffs_bson}},
                )
                .await
        );
        Ok(result)
    }

    pub async fn get_all_protocols(&self) -> Result<Vec<Protocol>, DatabaseResponse> {
        let result = self.protocols.find(doc! {}).await;

        match result {
            Ok(mut cursor) => {
                let mut protocols: Vec<Protocol> = Vec::new();
                while let Ok(Some(protocol)) = cursor.try_next().await {
                    protocols.push(protocol);
                }
                if protocols.is_empty() {
                    return Err(DatabaseResponse::new(
                        404,
                        "No protocols were found".to_string(),
                    ));
                }
                Ok(protocols)
            }
            Err(e) => Err(DatabaseResponse::new(
                500,
                format!("{}, {}", "Error retrieving protocols", e),
            )),
        }
    }

    pub async fn update_protocol(&self, protocol: Protocol) -> Result<Protocol, DatabaseResponse> {
        let result = self
            .protocols
            .replace_one(doc! {"name": protocol.name.clone()}, protocol.clone())
            .await;
        match result {
            Ok(update_result) => {
                if update_result.modified_count == 0 {
                    Err(DatabaseResponse::new(404, "Protocol not found".to_string()))
                } else {
                    Ok(protocol)
                }
            }
            Err(e) => Err(DatabaseResponse::new(500, format!("{}", e))),
        }
    }

    pub async fn add_quiz(&self, quiz: Quiz) -> Result<InsertOneResult, DatabaseResponse> {
        match self.quizes.insert_one(quiz).await {
            Ok(result) => Ok(result),
            Err(e) => Err(DatabaseResponse::new(
                500,
                format!("{}, {}", "Error creating quiz", e),
            )),
        }
    }

    pub async fn get_quiz_via_uuid(&self, uuid: String) -> Result<Quiz, DatabaseResponse> {
        let result = self.quizes.find_one(doc! {"uuid": uuid}).await;

        match result {
            Ok(Some(quiz)) => Ok(quiz),
            Ok(None) => Err(DatabaseResponse::new(404, "User not found".to_string())),
            Err(e) => Err(DatabaseResponse::new(500, format!("Database error: {}", e))),
        }
    }

    pub async fn get_quiz_participant_via_uuid(
        &self,
        quiz_uuid: String,
        participant_uuid: String,
    ) -> Result<Participant, DatabaseResponse> {
        let result = self.quizes.find_one(doc! {"uuid": quiz_uuid}).await;

        match result {
            Ok(Some(quiz)) => {
                if let Some(participant) = quiz
                    .participants
                    .iter()
                    .find(|p| p.user_uuid == participant_uuid)
                {
                    Ok(participant.clone())
                } else {
                    Err(DatabaseResponse::new(
                        404,
                        format!(
                            "Participant not found in quiz with UUID: {}",
                            participant_uuid
                        ),
                    ))
                }
            }
            Ok(None) => Err(DatabaseResponse::new(404, "Quiz not found".to_string())),
            Err(e) => Err(DatabaseResponse::new(500, format!("Database error: {}", e))),
        }
    }

    pub async fn update_quiz(&self, quiz: Quiz) -> Result<Quiz, DatabaseResponse> {
        let result = self
            .quizes
            .replace_one(doc! {"uuid": quiz.uuid.clone()}, quiz.clone())
            .await;
        match result {
            Ok(update_result) => {
                if update_result.modified_count == 0 {
                    Err(DatabaseResponse::new(404, "Quiz not found".to_string()))
                } else {
                    Ok(quiz)
                }
            }
            Err(e) => Err(DatabaseResponse::new(500, format!("{}", e))),
        }
    }

    pub async fn update_user(&self, user: User) -> Result<User, DatabaseResponse> {
        let result = self
            .users
            .replace_one(doc! {"user_uuid": user.user_uuid.clone()}, user.clone())
            .await;
        match result {
            Ok(update_result) => {
                if update_result.modified_count == 0 {
                    Err(DatabaseResponse::new(404, "User not found".to_string()))
                } else {
                    Ok(user)
                }
            }
            Err(e) => Err(DatabaseResponse::new(500, format!("{}", e))),
        }
    }

    pub async fn get_all_quizes(&self) -> Result<Vec<Quiz>, DatabaseResponse> {
        let result = self.quizes.find(doc! {}).await;

        match result {
            Ok(mut cursor) => {
                let mut quizes: Vec<Quiz> = Vec::new();
                while let Ok(Some(quiz)) = cursor.try_next().await {
                    quizes.push(quiz);
                }
                if quizes.is_empty() {
                    return Err(DatabaseResponse::new(404, "No Quiz were found".to_string()));
                }
                Ok(quizes)
            }
            Err(e) => Err(DatabaseResponse::new(
                500,
                format!("{}, {}", "Error retrieving Quizes", e),
            )),
        }
    }
}
