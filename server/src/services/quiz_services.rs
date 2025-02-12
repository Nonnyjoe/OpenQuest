// use alloy::primitives::{Address, U256};
// use alloy::providers::{Http, Provider};
// use alloy::signers::{LocalWallet, Signer};
// use chrono::Utc;
// use mongodb::{bson::doc, Client, Collection};
// use serde::{Deserialize, Serialize};
// use std::sync::Arc;
// use tokio::time::{self, Duration};

// #[derive(Debug, Serialize, Deserialize, Clone)]
// pub enum DifficultyLevel {
//     Easy,
//     Medium,
//     Hard,
// }

// #[derive(Debug, Serialize, Deserialize, Clone)]
// pub enum QuizAccess {
//     Public,
//     Private,
// }

// #[derive(Debug, Serialize, Deserialize, Clone)]
// pub struct Question {
//     pub question_text: String,
//     pub options: [String; 4],
//     pub correct_answer: char,
// }

// #[derive(Debug, Serialize, Deserialize, Clone)]
// pub struct Participant {
//     pub user_id: String,
//     pub score: Option<u32>,
// }

// #[derive(Debug, Serialize, Deserialize, Clone)]
// pub enum Status {
//     Pending,
//     Active,
//     Completed,
// }

// #[derive(Debug, Serialize, Deserialize, Clone)]
// pub struct Quiz {
//     pub uuid: String,
//     pub name: String,
//     pub difficulty: DifficultyLevel,
//     pub protocol: String,
//     pub description: String,
//     pub num_questions: usize,
//     pub questions: Vec<Question>,
//     pub access: QuizAccess,
//     pub total_reward: f64,
//     pub max_reward_per_user: f64,
//     pub duration_in_minutes: i64,
//     pub start_time: i64,
//     pub end_time: i64,
//     pub created_at: i64,
//     pub created_by: String,
//     pub participants: Vec<Participant>,
//     pub status: Status,
// }

// pub struct QuizService {
//     db: Collection<Quiz>,
//     provider: Arc<Http>,
//     wallet: LocalWallet,
//     contract_address: Address,
// }

// impl QuizService {
//     pub async fn new(
//         mongo_uri: &str,
//         rpc_url: &str,
//         private_key: &str,
//         contract_address: &str,
//     ) -> Self {
//         let client = Client::with_uri_str(mongo_uri)
//             .await
//             .expect("Failed to connect to MongoDB");
//         let db = client.database("quiz_db").collection::<Quiz>("quizzes");

//         let provider = Arc::new(Http::new(rpc_url).expect("Failed to create provider"));
//         let wallet = private_key
//             .parse::<LocalWallet>()
//             .expect("Invalid private key");
//         let contract_address = contract_address
//             .parse::<Address>()
//             .expect("Invalid contract address");

//         Self {
//             db,
//             provider,
//             wallet,
//             contract_address,
//         }
//     }

//     /// Periodically checks for quizzes that should be submitted to the blockchain
//     pub async fn start_quiz_submission(&self) {
//         let mut interval = time::interval(Duration::from_secs(60)); // Check every minute
//         loop {
//             interval.tick().await;
//             self.submit_eligible_quizzes().await;
//         }
//     }

//     /// Checks and submits quizzes whose start_time matches the current timestamp
//     pub async fn submit_eligible_quizzes(&self) {
//         let current_time = Utc::now().timestamp();
//         let filter = doc! { "start_time": current_time, "status": "Pending" };

//         match self.db.find(filter, None).await {
//             Ok(mut cursor) => {
//                 while let Some(quiz) = cursor.try_next().await.unwrap_or(None) {
//                     if let Err(err) = self.submit_quiz_to_contract(quiz.clone()).await {
//                         eprintln!("Error submitting quiz {}: {}", quiz.uuid, err);
//                     } else {
//                         // Update quiz status to Active
//                         self.db
//                             .update_one(
//                                 doc! { "uuid": &quiz.uuid },
//                                 doc! { "$set": { "status": "Active" } },
//                                 None,
//                             )
//                             .await
//                             .unwrap_or_else(|e| eprintln!("Failed to update quiz status: {}", e));
//                     }
//                 }
//             }
//             Err(e) => eprintln!("Error fetching eligible quizzes: {}", e),
//         }
//     }

//     /// Submits the quiz details to a Solidity contract using Alloy
//     async fn submit_quiz_to_contract(&self, quiz: Quiz) -> Result<(), Box<dyn std::error::Error>> {
//         let function_signature = "submitQuiz(string,uint256,uint256,uint256,uint256)";
//         let data = alloy::abi::encode_packed(&[
//             quiz.uuid.clone().into(),                    // string
//             U256::from(quiz.total_reward as u64),        // total reward
//             U256::from(quiz.max_reward_per_user as u64), // max per user
//             U256::from(quiz.start_time),                 // start time
//             U256::from(quiz.end_time),                   // end time
//         ])?;

//         let tx =
//             alloy::transactions::TypedTransaction::Legacy(alloy::transactions::TransactionLegacy {
//                 nonce: None,
//                 gas_price: Some(U256::from(10_000_000_000u64)), // Example gas price
//                 gas_limit: U256::from(300_000u64),
//                 to: Some(self.contract_address.into()),
//                 value: U256::zero(),
//                 data: data.into(),
//             });

//         let signed_tx = self
//             .wallet
//             .sign_transaction(&tx, &self.provider.chain_id().await?)
//             .await?;
//         let tx_hash = self.provider.send_raw_transaction(signed_tx).await?;

//         println!("Quiz {} submitted with TX hash: {:?}", quiz.uuid, tx_hash);
//         Ok(())
//     }
// }
