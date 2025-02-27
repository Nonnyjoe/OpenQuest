mod models;
mod routes;
mod services;
mod utils;
use actix_cors::Cors;
use actix_web::{
    get, http, middleware::Logger, web, web::Data, App, HttpResponse, HttpServer, Responder,
};
use dotenv::dotenv;
use routes::{
    health_routes::health_check,
    protocol_routes::{
        add_protocol_staff, get_all_protocols, get_protocol_by_id, get_protocol_via_name,
        register_protocol,
    },
    quizes_routes::{
        hacker_quize_route::{start_quiz, submit_quiz},
        protocol_quiz_route::{create_quiz, get_all_quiz, get_quiz_by_id},
    },
    user_routes::{
        get_all_users, get_user_by_id, get_user_via_email, link_wallet_address, login_user,
        register_user,
    },
};
use services::{db::Database, quiz_services::check_and_submit_quizzes};
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Set environment variables for logging
    std::env::set_var("RUST_LOG", "debug");
    std::env::set_var("RUST_BACKTRACE", "1");
    env_logger::init();

    // Initialize the database
    let db = Database::init().await;
    let db_data = Data::new(db.clone());
    dotenv().ok();
    // let db_url = env::var("DB_URL").expect("DB_URL must be set");

    // Clone the database for the quiz submission task
    let db_clone = db.clone();

    // Spawn a separate task for quiz submission
    tokio::spawn(async move {
        check_and_submit_quizzes(db_clone).await;
    });

    // Set server configurations
    let server_url = env::var("SERVER_URL").unwrap_or_else(|_| String::from("127.0.0.1"));
    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| String::from("80"))
        .parse()
        .expect("Not a valid port");

    // Start the HTTP server
    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .app_data(db_data.clone())
            .wrap(logger)
            .wrap(
                Cors::default()
                    // .allowed_origin("http://localhost:3000") // Allow requests from your frontend
                    .allow_any_origin()
                    .allowed_methods(vec!["GET", "POST", "PATCH", "DELETE"])
                    .allowed_headers(vec![
                        http::header::CONTENT_TYPE,
                        http::header::AUTHORIZATION,
                    ])
                    .supports_credentials(),
            )
            .service(health_check)
            .service(get_all_users)
            .service(register_user)
            .service(link_wallet_address)
            .service(login_user)
            .service(register_protocol)
            .service(get_all_protocols)
            .service(add_protocol_staff)
            .service(create_quiz)
            .service(start_quiz)
            .service(get_user_via_email)
            .service(get_user_by_id)
            .service(get_protocol_via_name)
            .service(get_protocol_by_id)
            .service(get_all_quiz)
            .service(get_quiz_by_id)
            .service(submit_quiz)
    })
    .bind((server_url, port))?
    .run()
    .await
}
