pub fn non_empty_trimmed(s: &str) -> bool {
  !s.trim().is_empty()
}

pub fn max_len(s: &str, max: usize) -> bool {
  s.len() <= max
}

pub fn opt_max_len(s: &Option<String>, max: usize) -> bool {
  match s {
    Some(v) => v.len() <= max,
    None => true,
  }
}

pub fn json_opt_max_bytes(v: &Option<serde_json::Value>, max_bytes: usize) -> bool {
  match v {
    Some(val) => serde_json::to_string(val).map(|s| s.len() <= max_bytes).unwrap_or(false),
    None => true,
  }
}

pub fn json_max_bytes(val: &serde_json::Value, max_bytes: usize) -> bool {
  serde_json::to_string(val).map(|s| s.len() <= max_bytes).unwrap_or(false)
}

pub fn looks_like_http_url(s: &str) -> bool {
  let s = s.trim();
  (s.starts_with("http://") || s.starts_with("https://")) && s.len() <= 2048
}

pub fn opt_url_ok(s: &Option<String>) -> bool {
  match s {
    Some(v) => looks_like_http_url(v),
    None => true,
  }
}
