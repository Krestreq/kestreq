use serde::Serialize;
use std::collections::HashMap;
use std::time::Instant;

use crate::HttpRequestParams;

/// Response data returned to the frontend
#[derive(Debug, Serialize)]
pub struct HttpResponse {
    pub status: u64,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub duration: u64,
    pub size: u64,
}

/// Send an HTTP request and return the response
pub async fn send_http_request(params: HttpRequestParams) -> Result<HttpResponse, String> {
    let start = Instant::now();

    // Build the client
    let mut client_builder = reqwest::ClientBuilder::new()
        .timeout(std::time::Duration::from_secs(params.timeout.unwrap_or(30)));

    // Apply redirect policy at the client level
    if !params.follow_redirects.unwrap_or(true) {
        client_builder = client_builder.redirect(reqwest::redirect::Policy::none());
    }

    let client = if params.ssl_verification.unwrap_or(true) {
        client_builder.build().map_err(|e| e.to_string())?
    } else {
        client_builder
            .danger_accept_invalid_certs(true)
            .build()
            .map_err(|e| e.to_string())?
    };

    // Build the request
    let method = reqwest::Method::from_bytes(params.method.as_bytes())
        .map_err(|e| format!("Invalid HTTP method: {}", e))?;

    let mut request_builder = client.request(method, &params.url);

    // Apply headers
    if let Some(headers) = &params.headers {
        for (key, value) in headers {
            request_builder = request_builder.header(key, value);
        }
    }

    // Apply body
    if let Some(body) = &params.body {
        request_builder = request_builder.body(body.clone());
    }

    // Send the request
    let response = request_builder.send().await.map_err(|e| e.to_string())?;

    // Extract status
    let status = response.status().as_u16() as u64;
    let status_text = response.status().to_string();

    // Extract headers
    let mut response_headers = HashMap::new();
    for (name, value) in response.headers() {
        if let Ok(val_str) = value.to_str() {
            response_headers.insert(name.to_string(), val_str.to_string());
        }
    }

    // Extract body
    let body_bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let body = String::from_utf8_lossy(&body_bytes).to_string();
    let size = body_bytes.len() as u64;

    let duration = start.elapsed().as_millis() as u64;

    Ok(HttpResponse {
        status,
        status_text,
        headers: response_headers,
        body,
        duration,
        size,
    })
}
