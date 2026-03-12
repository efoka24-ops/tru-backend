use sha2::{Digest, Sha256};

pub fn hash_login_code(code: &str) -> String {
  let mut hasher = Sha256::new();
  hasher.update(code.as_bytes());
  let out = hasher.finalize();
  hex::encode(out)
}
