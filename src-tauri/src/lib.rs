mod http_client;

use http_client::HttpResponse;
use serde::Deserialize;
use std::collections::HashMap;
use tauri::Manager;

/// Parameters for sending an HTTP request from the frontend
#[derive(Debug, Deserialize)]
pub struct HttpRequestParams {
    pub method: String,
    pub url: String,
    pub headers: Option<HashMap<String, String>>,
    pub body: Option<String>,
    pub timeout: Option<u64>,
    #[serde(rename = "followRedirects")]
    pub follow_redirects: Option<bool>,
    #[serde(rename = "sslVerification")]
    pub ssl_verification: Option<bool>,
}

/// Send an HTTP request and return the response
#[tauri::command]
async fn send_http_request(
    method: String,
    url: String,
    headers: Option<HashMap<String, String>>,
    body: Option<String>,
    timeout: Option<u64>,
    follow_redirects: Option<bool>,
    ssl_verification: Option<bool>,
) -> Result<HttpResponse, String> {
    let params = HttpRequestParams {
        method,
        url,
        headers,
        body,
        timeout,
        follow_redirects,
        ssl_verification,
    };
    http_client::send_http_request(params).await
}

/// Test connectivity to a URL
#[tauri::command]
async fn test_connection(url: String) -> Result<bool, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client.get(&url).send().await;
    Ok(response.is_ok())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                const APP_ICON: tauri::image::Image = tauri::include_image!("./icons/icon.png");
                window.set_icon(APP_ICON)?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![send_http_request, test_connection])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
