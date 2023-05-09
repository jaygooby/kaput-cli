use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AccountInfo {
    pub username: String,
    pub mail: String,
    pub account_active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AccountResponse {
    pub info: AccountInfo,
}

/// Returns the user's account info.
pub fn info(api_key: String) -> Result<AccountResponse, Box<dyn std::error::Error>> {
    let client = reqwest::blocking::Client::new();
    let response: AccountResponse = client
        .get("https://api.put.io/v2/account/info")
        .header("authorization", format!("Bearer {}", api_key))
        .send()?
        .json()?;
    Ok(response)
}
