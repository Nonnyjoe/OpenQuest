use super::db::Database;
use crate::models::quiz_model::{Quiz, QuizAccess};

use alloy::{network::EthereumWallet, providers::ProviderBuilder};

use alloy_signer_local::PrivateKeySigner;
use alloy_sol_types::sol;

use bincode;
use dotenv::dotenv;
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};
use std::env;

use std::io::Cursor;
use std::str::FromStr;
use std::time::Duration;
use tokio::time::sleep;
use zstd::stream::{decode_all, encode_all};

sol!(
    #[derive(Debug, Deserialize, Serialize)]
    #[allow(missing_docs)]
    #[sol(rpc)]
    OPENQUEST,
    "abi/QuizContractABI.json"
);

pub async fn check_and_submit_quizzes(db: Database) {
    loop {
        println!("Quiz Submitter Awake...");

        let now = chrono::Utc::now().timestamp();

        let quizes = db.get_all_quizes().await.unwrap_or(Vec::new());

        for mut quiz in quizes {
            println!("Checking Quiz {}", quiz.uuid);

            if quiz.end_time <= now && quiz.submited == false {
                // Send quiz to Solidity contract
                send_quiz_to_contract(&quiz).await;

                // Update quiz status to Completed
                quiz.submited = true;
                match db.update_quiz(quiz.clone()).await {
                    Ok(_result) => {
                        println!("Quiz {} submitted successfully", quiz.uuid);
                    }
                    Err(err) => {
                        println!("Error submitting quiz {}: {:?}", quiz.uuid, err);
                    }
                }
            } else {
                continue;
            }
        }

        // Sleep for a while before checking again
        println!("Quiz Submitter Resting for 3 Minutes...");
        sleep(Duration::from_secs(180)).await;
    }
}

async fn send_quiz_to_contract(quiz: &Quiz) {
    dotenv().ok();
    let rpc = env::var("RPC").expect("RPC must be set");
    let private_key = env::var("PRIVATE_KEY").expect("PRIVATE_KEY must be set");
    let open_quest_factory_address =
        env::var("OPENQUEST_FACTORY").expect("OPENQUEST_FACTORY must be set");

    // Compress the quiz data for the Solidity contract
    let compressed_quiz_data = compress_struct(&quiz.into_offchain_quiz_data());
    let _sybmit_result = submit_quiz(
        quiz.uuid.clone(),
        quiz.name.clone(),
        quiz.total_reward,
        quiz.max_reward_per_user,
        quiz.created_by.clone(),
        quiz.protocol.clone(),
        quiz.access.clone(),
        compressed_quiz_data,
        quiz.end_time,
        &private_key,
        &rpc,
        open_quest_factory_address,
    )
    .await;
}

fn compress_struct<T: Serialize>(data: &T) -> Vec<u8> {
    let serialized = bincode::serialize(data).expect("Serialization failed");
    encode_all(Cursor::new(serialized), 3).expect("Compression failed")
}

async fn submit_quiz(
    uuid: String,
    name: String,
    total_reward: f64,
    max_reward_per_user: f64,
    created_by: String,
    protocol: String,
    access: QuizAccess,
    compressed_data: Vec<u8>,
    end_time: i64,
    private_key: &str,
    rpc_url: &str,
    contract_address: String,
) -> Result<(), Box<dyn std::error::Error>> {
    // Create a signer from the private key
    let signer = PrivateKeySigner::from_str(private_key)?;

    let wallet = EthereumWallet::from(signer.clone());

    // Create a provider (e.g., HTTP provider)
    let provider = ProviderBuilder::new()
        .wallet(wallet)
        .on_http(rpc_url.parse()?);

    let open_quest = OPENQUEST::new(contract_address.parse()?, provider);

    let tx_hash = open_quest
        .gradeQuiz(
            uuid.as_str().into(),
            name.as_str().into(),
            total_reward.try_into()?,
            max_reward_per_user.try_into()?,
            created_by.parse()?,
            protocol.as_str().into(),
            access.to_string().into(),
            compressed_data.into(),
            end_time.try_into()?,
        )
        .send()
        .await?
        .watch()
        .await?;

    println!("Transaction submitted: {:?}", tx_hash);

    Ok(())
}
