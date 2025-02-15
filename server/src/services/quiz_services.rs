use super::db::Database;
use crate::models::{
    quiz_model::{Quiz, QuizAccess, Status},
    user_model::QuizResult,
};
use alloy::{
    network::EthereumWallet,
    primitives::{Address, U256},
    providers::ProviderBuilder,
};
use alloy_contract::Event;
use alloy_primitives::{keccak256, Bytes};
use alloy_provider::Provider;
use alloy_rpc_types::eth::{Filter, FilteredParams, Log};
use alloy_signer_local::PrivateKeySigner;
use alloy_sol_types::sol;
use bincode;
use dotenv::dotenv;
use ethabi::{decode, ParamType, Token};
use futures_util::{StreamExt, TryStreamExt};
use hex::decode as hex_decode;
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};
use std::env;
use std::str::FromStr;
use std::time::Duration;
use tokio::sync::oneshot;
use tokio::time::sleep;

#[derive(Debug, Deserialize)]
struct PtotocolCreated {
    admin: Address,
    time: U256,
    protocol_id: String,
    protocol_contract: Address,
}

#[derive(serde::Deserialize, Debug, Clone)]
struct RewardData {
    user_address: String,
    reward_amount: f64,
    leader_boar_addition: f64,
    quiz_score: f64,
}

#[derive(serde::Deserialize, Debug, Clone)]
struct QuizResponse {
    uuid: String,
    protocol: String,
    results: Vec<RewardData>,
}

sol!(
    #[derive(Debug, Deserialize, Serialize)]
    #[allow(missing_docs)]
    #[sol(rpc)]
    ProtocolABI,
    "abi/ProtocolABI.json"
);

sol!(
    #[derive(Debug, Deserialize, Serialize)]
    #[allow(missing_docs)]
    #[sol(rpc)]
    FACTORY,
    "abi/ProtocolFactoryABI.json"
);

sol!(
   interface IProtocol {
        #[derive(Debug)]
       event ResultReceived(bytes data);
   }
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
                // Send quiz to Solidity
                let (status, compressed_data, address) =
                    send_quiz_to_contract(&quiz, db.clone()).await;
                match status {
                    true => {
                        let quiz_response =
                            get_quiz_response(compressed_data.clone(), address.clone())
                                .await
                                .unwrap();
                        if quiz_response.contains(&"false".to_string()) {
                            println!("Quiz {} submission failed", quiz.uuid);
                            continue;
                        } else {
                            let hex_str = quiz_response.trim_start_matches("0x");
                            let bytes_response = hex_decode(hex_str).unwrap();
                            println!("Bytes response: {:?}", bytes_response);

                            let data = decode_quiz_response(&bytes_response).unwrap();
                            println!("Quiz response: {:?}", data);
                            quiz.submited = true;
                            quiz.status = Status::Completed;
                            match db.update_quiz(quiz.clone()).await {
                                Ok(_result) => {
                                    match sort_quiz_data(data.clone(), db.clone()).await {
                                        true => {
                                            println!("Quiz {} sorted successfully", quiz.uuid);
                                        }
                                        false => {
                                            println!("Error sorting quiz {}", quiz.uuid);
                                        }
                                    };
                                    println!("Quiz {} updated successfully", quiz.uuid);
                                }
                                Err(err) => {
                                    println!("Error updating quiz {}: {:?}", quiz.uuid, err);
                                }
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

async fn send_quiz_to_contract(quiz: &Quiz, db: Database) -> (bool, String, String) {
    dotenv().ok();
    let rpc = env::var("RPC").expect("RPC must be set");
    let private_key = env::var("PRIVATE_KEY").expect("PRIVATE_KEY must be set");

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
        compressed_quiz_data.clone(),
        quiz.end_time,
        &private_key,
        &rpc,
        protocol_address.clone(),
    )
    .await;

    // let quiz_response: Result<String, Box<dyn Error + Send + Sync>> =
    //     get_quiz_response(compressed_quiz_data.clone(), protocol_address.clone()).await;

    match submit_result {
        Ok(_) => {
            println!("Successful submission");
            // let quiz_response: Result<String, Box<dyn Error + Send + Sync>> =
            //     get_quiz_response(compressed_quiz_data.clone(), protocol_address.clone()).await;
            return (true, compressed_quiz_data.clone(), protocol_address.clone());
        }
        Err(err) => {
            println!("Error submitting quiz: {:?}", err);
            return (
                false,
                compressed_quiz_data.clone(),
                protocol_address.clone(),
            );
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
    println!("RECIPT DATA IS: {:?}", receipt);

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
    let protocol_instance = ProtocolABI::new(protocol_addr, provider);

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

    println!("Transaction submitted, TX-Hash is: {:?}", tx_hash);

    Ok(())
}

pub async fn get_quiz_response(
    compressed_quiz_data: String,
    protocol_address: String,
) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let rpc = env::var("RPC").expect("RPC must be set");
    let private_key = env::var("PRIVATE_KEY").expect("PRIVATE_KEY must be set");
    let open_quest_factory_address =
        env::var("OPENQUEST_FACTORY").expect("OPENQUEST_FACTORY must be set");

    // Create a signer from the private key
    let signer = PrivateKeySigner::from_str(private_key.as_str())?;

    let wallet = EthereumWallet::from(signer.clone());

    // Create a provider (e.g., HTTP provider)
    let provider = ProviderBuilder::new().wallet(wallet).on_http(rpc.parse()?);

    let protocol_addr = Address::from_str(&protocol_address).unwrap();

    println!("protocol_address: {}", protocol_addr);
    let protocol_instance = ProtocolABI::new(protocol_addr, provider);

    // Convert the quiz data into Bytes and then hash it using keccak256
    let bytes: Bytes = compressed_quiz_data.parse::<Bytes>().unwrap();
    let hashed_data = keccak256(bytes.clone());

    // Call the checkQuizResponse view function
    let response_bytes = protocol_instance
        .checkQuizResponse(hashed_data)
        .call()
        .await?;

    println!("Raw response bytes: {:?}", response_bytes._0);
    let response = response_bytes._0;

    // Convert the Bytes to a String
    // let response_str = String::from_utf8_lossy(&response_bytes._0).to_string();

    println!("Quiz Response as String: {}", format!("{}", response));

    if response.len() < 4 {
        println!("No quiz response available yet.");
        return Ok("false".to_string());
    }

    Ok(format!("{}", response))
}

pub async fn subscribe_to_log(
    contract_address: String,
    shutdown_tx: oneshot::Sender<()>,
) -> Result<(), Box<dyn std::error::Error>> {
    let rpc = env::var("RPC").expect("RPC must be set");
    let private_key = env::var("PRIVATE_KEY").expect("PRIVATE_KEY must be set");

    // let wallet = LocalWallet::from_str(&private_key)?.with_chain_id(Chain::Mainnet);

    let signer = PrivateKeySigner::from_str(private_key.as_str())?;

    let wallet = EthereumWallet::from(signer.clone());

    // Retrieve environment variables
    let rpc = env::var("RPC").expect("RPC must be set");

    // let provider = ProviderBuilder::new().wallet(wallet).on_http(rpc.parse()?);

    let provider = ProviderBuilder::new()
        .wallet(wallet.clone())
        .on_http(rpc.parse()?);

    let protocol_addr = Address::from_str(&contract_address)?;

    let filter = Filter::new()
        .address(protocol_addr)
        .event("ResultReceived(bytes)");
    // let event: Event<(), _, IProtocol::ResultReceived, _> = Event::new(&provider, Filter::new());
    let event: Event<(), _, IProtocol::ResultReceived, _> = Event::new(&provider, filter);

    let subscription = event.subscribe().await?;
    let mut stream = subscription.into_stream();

    println!("Listening for ResultReceived events...");

    while let Ok((stream_event, _)) = stream.next().await.unwrap() {
        println!("new result received {:?}", stream_event);
        // Send shutdown signal after processing the event
        let _ = shutdown_tx.send(());
        break;
    }

    Ok(())
}

fn decode_quiz_response(encoded: &[u8]) -> Result<QuizResponse, String> {
    let decoded: QuizResponse = serde_json::from_slice(&encoded).unwrap();
    Ok(decoded)
}

async fn sort_quiz_data(data: QuizResponse, db: Database) -> bool {
    let results = data.results.clone();
    for result in results {
        println!(
            "SORTING RESULT FOR USER WITH ADDRESS: {:?}",
            result.user_address
        );
        let user = db.get_user_via_address(result.user_address.clone()).await;
        match user {
            Ok(mut user) => {
                user.update_leader_board_point(data.protocol.clone(), result.leader_boar_addition);
                user.update_total_reward(result.reward_amount);
                user.quizes.push(QuizResult {
                    quiz_uuid: data.uuid.clone(),
                    score: result.quiz_score,
                    reward: result.reward_amount,
                });

                match db.update_user(user).await {
                    Ok(_) => {
                        println!("User updated successfully.");
                        return true;
                    }
                    Err(e) => {
                        println!("Error updating user: {}", e.message);
                        return false;
                    }
                }
            }
            Err(e) => {
                println!(
                    "User not found for address: {}. Error: {}",
                    result.user_address, e.message
                );
            }
        }
    }
    return false;
}
