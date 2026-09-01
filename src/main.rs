#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server, StatusCode};
use serde_json::json;
use std::convert::Infallible;
use std::net::SocketAddr;
use tauri::api::shell::Command;

#[derive(serde::Deserialize, Debug)]
struct DiagnosisPayload {
    sessionId: String,
    userName: String,
    answers: serde_json::Value,
    diagnosis: serde_json::Value,
    createdAt: String,
    timestamp: String,
}

async fn handle_request(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    match (req.method(), req.uri().path()) {
        (&hyper::Method::POST, "/api/diagnosis") => {
            // POST ボディを読む
            let body_bytes = hyper::body::to_bytes(req.into_body())
                .await
                .unwrap_or_default();

            let payload: Result<DiagnosisPayload, _> =
                serde_json::from_slice(&body_bytes);

            match payload {
                Ok(data) => {
                    // ここで React 側に通知
                    println!("Diagnosis received: {:?}", data);

                    // Tauri イベントで React に送信
                    // window.emit('diagnosis-received', data);
                    // → React 側で受信して Zustand に追加

                    Ok(Response::new(Body::from(
                        json!({
                            "success": true,
                            "message": "Diagnosis received",
                            "sessionId": data.sessionId
                        })
                        .to_string(),
                    )))
                }
                Err(e) => {
                    eprintln!("Parse error: {}", e);
                    Ok(Response::builder()
                        .status(StatusCode::BAD_REQUEST)
                        .body(Body::from("Invalid payload"))
                        .unwrap())
                }
            }
        }
        (&hyper::Method::GET, "/api/health") => {
            Ok(Response::new(Body::from(
                json!({"status": "ok"}).to_string(),
            )))
        }
        _ => {
            Ok(Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from("Not found"))
                .unwrap())
        }
    }
}

#[tokio::main]
async fn main() {
    // HTTP サーバー起動
    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    let make_svc = make_service_fn(|_conn| async {
        Ok::<_, Infallible>(service_fn(handle_request))
    });

    let server = Server::bind(&addr).serve(make_svc);
    println!("Diagnosis API listening on {}", addr);

    // Tauri ウィンドウ起動
    tauri::Builder::default()
        .setup(|_app| {
            // HTTP サーバーをバックグラウンドで実行
            tokio::spawn(async move {
                if let Err(e) = server.await {
                    eprintln!("Server error: {}", e);
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}