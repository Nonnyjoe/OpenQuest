use super::db::Database;
use crate::models::quiz_model::{Quiz, QuizAccess};

use alloy::{
    network::EthereumWallet,
    primitives::{Address, U256},
    providers::ProviderBuilder,
};

use alloy_primitives::Bytes;
use alloy_provider::Provider;
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

#[derive(Debug, Deserialize)]
struct PtotocolCreated {
    admin: Address,
    time: U256,
    protocol_id: String,
    protocol_contract: Address,
}

sol!(
    #[derive(Debug, Deserialize, Serialize)]
    #[allow(missing_docs)]
    #[sol(rpc)]
    PROTOCOL,
    "abi/ProtocolABI.json"
);

sol!(
    #[derive(Debug, Deserialize, Serialize)]
    #[allow(missing_docs)]
    #[sol(rpc)]
    FACTORY,
    "abi/ProtocolFactoryABI.json"
);

pub async fn check_and_submit_quizzes(db: Database) {
    loop {
        println!("Quiz Submitter Awake...");

        let now = chrono::Utc::now().timestamp();
        println!("current time: {}", now);

        let quizes = db.get_all_quizes().await.unwrap_or(Vec::new());
        // println!("quizes are: {:?}", quizes);

        for mut quiz in quizes {
            println!("Checking Quiz {}", quiz.uuid);

            if quiz.end_time <= now && quiz.submited == false {
                // Send quiz to Solidity contract
                match send_quiz_to_contract(&quiz, db.clone()).await {
                    true => {
                        quiz.submited = true;
                        match db.update_quiz(quiz.clone()).await {
                            Ok(_result) => {
                                println!("Quiz {} submitted successfully", quiz.uuid);
                            }
                            Err(err) => {
                                println!("Error submitting quiz {}: {:?}", quiz.uuid, err);
                            }
                        }
                    }
                    false => {}
                }

                // Update quiz status to Completed
            } else {
                continue;
            }
        }

        // Sleep for a while before checking again
        println!("Quiz Submitter Resting for 3 Minutes...");
        sleep(Duration::from_secs(60)).await;
    }
}

async fn send_quiz_to_contract(quiz: &Quiz, db: Database) -> bool {
    dotenv().ok();
    let rpc = env::var("RPC").expect("RPC must be set");
    let private_key = env::var("PRIVATE_KEY").expect("PRIVATE_KEY must be set");
    let open_quest_factory_address =
        env::var("OPENQUEST_FACTORY").expect("OPENQUEST_FACTORY must be set");

    let protocol_address = db
        .get_protocol_via_name(quiz.protocol.clone())
        .await
        .unwrap()
        .contract_address;

    let user = db.get_user_via_uuid(quiz.created_by.clone()).await.unwrap();

    // Compress the quiz data for the Solidity contract
    let compressed_quiz_data = compress_struct(&quiz.into_offchain_quiz_data());
    let submit_result = submit_quiz(
        quiz.uuid.clone(),
        quiz.name.clone(),
        quiz.total_reward,
        quiz.max_reward_per_user,
        user.wallet.wallet_address.clone().unwrap(),
        quiz.protocol.clone(),
        quiz.access.clone(),
        compressed_quiz_data,
        quiz.end_time,
        &private_key,
        &rpc,
        protocol_address,
    )
    .await;

    match submit_result {
        Ok(_) => {
            println!("Successful submission");
            return true;
        }
        Err(err) => {
            println!("Error submitting quiz: {:?}", err);
            return false;
        }
    }

    // println!("Successful submission with txid: {}", txid);
}

fn compress_struct<T: Serialize>(data: &T) -> String {
    let serialized = bincode::serialize(data).expect("Serialization failed");
    println!("serialiszed data: {:?}", serialized);
    let compressed = format!("0x{}", hex::encode(serialized));
    println!("Compressed data: {:?}", compressed);
    return compressed;
}

pub async fn createProtocolOnchain(
    name: String,
    protocol_id: String,
) -> Result<(String), Box<dyn std::error::Error>> {
    let rpc = env::var("RPC").expect("RPC must be set");
    let private_key = env::var("PRIVATE_KEY").expect("PRIVATE_KEY must be set");
    let open_quest_factory_address =
        env::var("OPENQUEST_FACTORY").expect("OPENQUEST_FACTORY must be set");

    // Create a signer from the private key
    let signer = PrivateKeySigner::from_str(private_key.as_str())?;

    let wallet = EthereumWallet::from(signer.clone());

    // Create a provider (e.g., HTTP provider)
    let provider = ProviderBuilder::new().wallet(wallet).on_http(rpc.parse()?);

    let protocl_factory = FACTORY::new(open_quest_factory_address.parse()?, provider.clone());

    let tx_hash = protocl_factory
        .createProtocol(name.as_str().into(), protocol_id.as_str().into())
        .send()
        .await?
        .watch()
        .await?;

    let receipt = provider.get_transaction_receipt(tx_hash).await?.unwrap();

    let log = receipt.inner.logs()[1].inner.data.topics()[3];
    let address_bytes = &log.as_slice()[12..32];
    let contract_address = Address::from_slice(address_bytes);

    println!("Protocol Created, tx_hash: {}", contract_address);
    println!("Address as string: {}", contract_address.to_string());

    // let tx_hash = open_quest
    //     .gradeQuiz(
    Ok(contract_address.to_string())
}

async fn submit_quiz(
    uuid: String,
    name: String,
    total_reward: f64,
    max_reward_per_user: f64,
    created_by: String,
    protocol: String,
    access: QuizAccess,
    compressed_data: String,
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

    let protocol_addr = Address::from_str(&contract_address).unwrap();

    println!("protocol_address: {}", protocol_addr);
    let protocol_instance = PROTOCOL::new(protocol_addr, provider);

    println!(
        "{}, {}, {:?}, {:?}, {:?}, {}, {}, {:?}, {:?}",
        uuid.as_str(),
        name.as_str(),
        total_reward,
        max_reward_per_user,
        created_by,
        protocol.as_str(),
        access.to_string(),
        compressed_data,
        end_time
    );

    let bytes: Bytes = compressed_data.parse::<Bytes>().unwrap();
    println!("bytes_data = {:?}", bytes);

    let tx_hash = protocol_instance
        .gradeQuiz(
            uuid.as_str().into(),
            name.as_str().into(),
            total_reward.try_into()?,
            max_reward_per_user.try_into()?,
            created_by.parse()?,
            protocol.as_str().into(),
            access.to_string().into(),
            bytes,
            end_time.try_into()?,
        )
        .send()
        .await?
        .watch()
        .await?;

    // let tx_hash = open_quest
    //     .gradeQuiz(
    // uuid.as_str().into(),
    // name.as_str().into(),
    // total_reward.try_into()?,
    // max_reward_per_user.try_into()?,
    // created_by.parse()?,
    // protocol.as_str().into(),
    // access.to_string().into(),
    // compressed_data.into(),
    // end_time.try_into()?,
    //     )
    // .send()
    // .await?
    // .watch()
    // .await?;

    println!("Transaction submitted, TX-Hash is: {:?}", tx_hash);

    Ok(())
}
