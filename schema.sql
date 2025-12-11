CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  card_id TEXT,
  amount INTEGER,
  currency TEXT,
  approved INTEGER
);
