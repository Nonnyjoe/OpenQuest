use base64::decode as base64_decode;
use hex;
use json::{object, JsonValue};
use rand::seq::SliceRandom;
use rand::SeedableRng;
use rand_chacha::ChaCha20Rng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::io::Cursor;
use zstd::stream::{decode_all, encode_all};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QuizOffchainData {
    pub uuid: String,
    pub protocol: String,
    pub num_questions: usize,
    pub questions: Vec<Question>,
    pub total_reward: f64,
    pub max_reward_per_user: f64,
    pub participants: Vec<Participant>,
    pub reward_type: RewardType,
    pub difficulty: DifficultyLevel,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum DifficultyLevel {
    Easy,
    Medium,
    Hard,
}

impl DifficultyLevel {
    fn multiplier(&self) -> f64 {
        match self {
            DifficultyLevel::Easy => 1.0,
            DifficultyLevel::Medium => 1.5,
            DifficultyLevel::Hard => 2.0,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct RewardData {
    user_address: String,
    reward_amount: f64,
    leader_boar_addition: f64,
    quiz_score: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct QuizResponse {
    uuid: String,
    protocol: String,
    results: Vec<RewardData>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum RewardType {
    DistributedByRankToTopFive,
    DistributedEqullyToTopFive,
    DistributedByLottery,
}

impl RewardType {
    pub fn to_string(&self) -> &'static str {
        match self {
            RewardType::DistributedByRankToTopFive => "DistributedByRankToTopFive",
            RewardType::DistributedEqullyToTopFive => "DistributedEqullyToTopFive",
            RewardType::DistributedByLottery => "DistributedByLottery",
        }
    }
    pub fn from_str(value: &str) -> Option<RewardType> {
        match value.to_lowercase().as_str() {
            "distributed_by_rank" => Some(RewardType::DistributedByRankToTopFive),
            "distributed_equally" => Some(RewardType::DistributedEqullyToTopFive),
            "distributed_by_lottery" => Some(RewardType::DistributedByLottery),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Participant {
    pub user_uuid: String,
    pub wallet_address: String,
    pub score: i64,
    pub answered_questions: Vec<QuizAnswer>, // Question index and answer index
    pub submission_time: i64,
    pub start_time: i64,
    pub reward: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum OptionIndex {
    A,
    B,
    C,
    D,
}

impl OptionIndex {
    pub fn to_string(&self) -> &'static str {
        match self {
            OptionIndex::A => "A",
            OptionIndex::B => "B",
            OptionIndex::C => "C",
            OptionIndex::D => "D",
        }
    }

    pub fn from_str(value: &str) -> Option<OptionIndex> {
        match value.to_lowercase().as_str() {
            "a" => Some(OptionIndex::A),
            "b" => Some(OptionIndex::B),
            "c" => Some(OptionIndex::C),
            "d" => Some(OptionIndex::D),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QuizOption {
    pub text: String,
    pub option_index: OptionIndex,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Question {
    pub id: usize, // Question index
    pub question_text: String,
    pub options: [QuizOption; 4],    // Options A-D
    pub correct_answer: OptionIndex, // 'A', 'B', 'C', or 'D'
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QuizAnswer {
    pub question_id: usize,
    pub answer: OptionIndex,
}

pub async fn handle_advance(
    _client: &hyper::Client<hyper::client::HttpConnector>,
    _server_addr: &str,
    request: JsonValue,
) -> Result<&'static str, Box<dyn std::error::Error>> {
    println!("Received advance request data {}", &request);
    let _payload = request["data"]["payload"]
        .as_str()
        .ok_or("Missing payload")?;

    let msg_sender = request["data"]["metadata"]["msg_sender"]
        .as_str()
        .ok_or("Missing caller")?;

    println!("caller is {}", msg_sender);
    let time_stamp: u128 = (request["data"]["metadata"]["timestamp"])
        .to_string()
        .parse::<u128>()
        .expect("Invalid timestamp");

    let modified_string = remove_first_two_chars(&_payload);
    println!("payload without unnecesary content is: {}", modified_string);

    let mut quiz = decompress_data(modified_string.as_str());
    let participants = grade_participants(&mut quiz.questions, quiz.participants.clone());
    let winners = calculate_reward_distribution(
        participants.clone(),
        quiz.total_reward,
        quiz.reward_type.clone(),
    );

    let mut onchain_data: QuizResponse = QuizResponse {
        uuid: quiz.uuid.clone(),
        protocol: quiz.protocol.clone(),
        results: Vec::new(),
    };

    for participant in participants {
        println!(
            "Participant: {} Score: {}",
            participant.user_uuid, participant.score
        );
        let mut user_reward: f64 = 0.0;
        for winner in winners.clone() {
            if winner.user_uuid == participant.user_uuid {
                user_reward = winner.reward;
                break;
            }
        }

        let mut userData = RewardData {
            user_address: participant.wallet_address.clone(),
            reward_amount: user_reward,
            leader_boar_addition: calculate_leaderboard_points(&quiz, participant.score as f64),
            quiz_score: participant.score as f64,
        };

        onchain_data.results.push(userData);
    }

    // Serialize to JSON
    let serialized = serde_json::to_string(&onchain_data).unwrap();
    println!("Serialized JSON: {}", serialized);

    // Convert JSON string to bytes
    let bytes = serialized.as_bytes();

    // Convert bytes to hex (for easier Solidity decoding)
    let hex_encoded = hex::encode(bytes);
    println!("Hex-encoded bytes: 0x{}", hex_encoded);

    // Create a notice
    let notice = object! { "payload" => hex_encoded };
    let notice_request = hyper::Request::builder()
        .method(hyper::Method::POST)
        .uri(format!("{}/notice", server_addr))
        .header("Content-Type", "application/json")
        .body(hyper::Body::from(notice.dump()))?;

    // Send the notice
    let response = client.request(notice_request).await?;

    Ok("accept")
}

pub async fn handle_inspect(
    _client: &hyper::Client<hyper::client::HttpConnector>,
    _server_addr: &str,
    request: JsonValue,
) -> Result<&'static str, Box<dyn std::error::Error>> {
    println!("Received inspect request data {}", &request);
    let _payload = request["data"]["payload"]
        .as_str()
        .ok_or("Missing payload")?;
    println!("payload is: {}", _payload);

    // TODO: add application logic here
    Ok("accept")
}

fn remove_first_two_chars(s: &str) -> String {
    if s.starts_with("0x") {
        if let Some((index, _)) = s.char_indices().nth(2) {
            s[index..].to_string()
        } else {
            String::new()
        }
    } else {
        return s.to_string();
    }
}

fn grade_participants(
    questions: &mut Vec<Question>,
    mut participants: Vec<Participant>,
) -> Vec<Participant> {
    for mut participant in participants.iter_mut() {
        let mut total_score = 0;
        for quiz_answer in participant.answered_questions.iter() {
            let question_id = quiz_answer.question_id;
            let option_selected = &quiz_answer.answer;
            let question = questions.iter_mut().find(|q| q.id == question_id);
            match question {
                Some(question) => {
                    if question.correct_answer == *option_selected {
                        total_score += 1;
                    }
                }
                None => {
                    // Handle error for missing question
                }
            }
        }
        participant.score = total_score;
    }
    return participants.to_vec();
}

fn calculate_reward_distribution(
    mut participants: Vec<Participant>,
    total_reward: f64,
    reward_type: RewardType,
) -> Vec<Participant> {
    match reward_type {
        RewardType::DistributedByRankToTopFive => {
            // Sort participants by score in descending order
            participants.sort_by(|a, b| b.score.cmp(&a.score));

            // Take the top 5 participants (cloning because iter() produces references)
            let top_participants: Vec<Participant> = if participants.len() <= 5 {
                participants.clone()
            } else {
                participants.iter().take(5).cloned().collect()
            };

            // Group participants by their scores
            let mut score_groups: HashMap<i64, Vec<Participant>> = HashMap::new();
            for participant in top_participants.clone() {
                score_groups
                    .entry(participant.score)
                    .or_default()
                    .push(participant);
            }

            // Calculate the total number of unique ranks
            let unique_scores = score_groups.len() as f64;

            // Calculate total weight based on ranking (e.g., descending order 5,4,3...)
            let mut rank = unique_scores as u64;
            let mut total_weight = 0.0;
            let mut score_to_weight = HashMap::new();

            for (score, group) in &score_groups {
                // Assign weight for each distinct score
                let weight = rank as f64;
                score_to_weight.insert(*score, weight);
                total_weight += weight * group.len() as f64;
                rank -= 1;
            }

            // Distribute rewards
            let mut rewards_distributed = 0.0;
            let mut final_winners: Vec<Participant> = Vec::new();

            for (score, group) in score_groups {
                let group_weight = score_to_weight[&score];
                let total_group_reward =
                    total_reward * (group_weight * group.len() as f64) / total_weight;

                // Split the group's total reward equally among participants with the same score
                let per_participant_reward = total_group_reward / group.len() as f64;

                for mut participant in group {
                    participant.reward = per_participant_reward;
                    rewards_distributed += per_participant_reward;
                    final_winners.push(participant);
                }
            }

            println!("Distributed rewards by rank to {:?}", final_winners);
            final_winners
        }
        RewardType::DistributedEqullyToTopFive => {
            // Sort participants by descending score
            participants.sort_by(|a, b| b.score.cmp(&a.score));

            // Select the top 5 participants or all if fewer than 5
            let top_participants: Vec<Participant> = if participants.len() <= 5 {
                participants.clone()
            } else {
                participants.iter().take(5).cloned().collect()
            };

            // Calculate the equal reward
            let reward_per_participant = total_reward / top_participants.len() as f64;

            // Distribute rewards equally
            let mut rewarded_participants = top_participants
                .into_iter()
                .map(|mut p| {
                    p.reward = reward_per_participant;
                    p
                })
                .collect::<Vec<Participant>>();

            println!("Distributed rewards equally to {:?}", rewarded_participants);
            rewarded_participants
        }

        RewardType::DistributedByLottery => {
            let salt = format!(
                "SaltFrom{}{}{}",
                participants.len(),
                total_reward,
                reward_type.to_string()
            );

            // Shuffle participants using the salt
            shuffle_with_salt(&mut participants, salt.as_bytes());

            // Select the top 5 participants if possible
            let lottery_winners: Vec<Participant> = if participants.len() <= 5 {
                participants.clone()
            } else {
                participants.iter().take(5).cloned().collect()
            };

            // Distribute rewards equally among the lottery winners
            let reward_per_winner = total_reward / lottery_winners.len() as f64;
            let mut rewarded_lottery_winners = lottery_winners
                .into_iter()
                .map(|mut p| {
                    p.reward = reward_per_winner;
                    p
                })
                .collect::<Vec<Participant>>();

            println!("Lottery winners: {:?}", rewarded_lottery_winners);
            rewarded_lottery_winners
        }
    }
}

fn decompress_data(compressed: &str) -> QuizOffchainData {
    // Decode from base64 string to bytes
    let compressed_bytes = base64_decode(compressed).expect("Invalid base64 input");

    // Decompress bytes
    let mut decompressed = String::new();
    let decompressed_bytes =
        decode_all(Cursor::new(compressed_bytes)).expect("Decompression failed");

    let quiz: QuizOffchainData = serde_json::from_str(&decompressed).expect("Failed to parse JSON");
    return quiz;
}

fn shuffle_with_salt<T>(vec: &mut Vec<T>, salt: &[u8]) {
    // Derive a deterministic seed from the salt
    let seed = {
        let mut hash = 0u64;
        for &byte in salt {
            hash = hash.wrapping_mul(31).wrapping_add(byte as u64);
        }
        hash
    };

    // Create a seeded RNG using the derived seed
    let mut rng = ChaCha20Rng::seed_from_u64(seed);
    vec.shuffle(&mut rng);
}

fn calculate_leaderboard_points(quiz: &QuizOffchainData, user_score: f64) -> f64 {
    let base_points = 10.0; // Base points for any quiz completion
    let score_percentage = (user_score / quiz.questions.len() as f64) * 100.0;
    let difficulty_multiplier = quiz.difficulty.multiplier();

    let points_earned = base_points + (score_percentage * difficulty_multiplier);
    println!("User Point Earned is: {}", points_earned);
    return points_earned;
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = hyper::Client::new();
    let server_addr = env::var("ROLLUP_HTTP_SERVER_URL")?;

    let mut status = "accept";
    loop {
        println!("Sending finish");
        let response = object! {"status" => status.clone()};
        let request = hyper::Request::builder()
            .method(hyper::Method::POST)
            .header(hyper::header::CONTENT_TYPE, "application/json")
            .uri(format!("{}/finish", &server_addr))
            .body(hyper::Body::from(response.dump()))?;
        let response = client.request(request).await?;
        println!("Received finish status {}", response.status());

        if response.status() == hyper::StatusCode::ACCEPTED {
            println!("No pending rollup request, trying again");
        } else {
            let body = hyper::body::to_bytes(response).await?;
            let utf = std::str::from_utf8(&body)?;
            let req = json::parse(utf)?;

            let request_type = req["request_type"]
                .as_str()
                .ok_or("request_type is not a string")?;
            status = match request_type {
                "advance_state" => handle_advance(&client, &server_addr[..], req).await?,
                "inspect_state" => handle_inspect(&client, &server_addr[..], req).await?,
                &_ => {
                    eprintln!("Unknown request type");
                    "reject"
                }
            };
        }
    }
}
