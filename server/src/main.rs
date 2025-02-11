mod models;
mod routes;
mod services;
mod utils;
use actix_web::{
    get, http, middleware::Logger, web, web::Data, App, HttpResponse, HttpServer, Responder,
};
use routes::{
    health_routes::health_check,
    protocol_routes::{add_protocol_staff, get_all_protocols, register_protocol},
    user_routes::{get_all_users, link_wallet_address, login_user, register_user},
};
use services::db::Database;
use std::env;
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "debug");
    std::env::set_var("RUST_BACKTRACE", "1");
    env_logger::init();
    let db = Database::init().await;

    let server_url = env::var("SERVER_URL").unwrap_or_else(|_| String::from("127.0.0.1"));
    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| String::from("80"))
        .parse()
        .expect("Not a valid port");

    let db_data = Data::new(db);

    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .app_data(db_data.clone())
            .wrap(logger)
            .service(health_check)
            .service(get_all_users)
            .service(register_user)
            .service(link_wallet_address)
            .service(login_user)
            .service(register_protocol)
            .service(get_all_protocols)
            .service(add_protocol_staff)
    })
    .bind((server_url, port))?
    .run()
    .await
}
