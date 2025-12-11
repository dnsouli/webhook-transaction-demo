const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function initDb() {
  // Ensure DB file exists (it will be created by sqlite when opening)
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Failed to open DB:', err);
      process.exit(1);
    }
  });

  // Run schema (creates tables if not exist)
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema, (err) => {
    if (err) {
      console.error('Failed to run schema.sql:', err);
      process.exit(1);
    }
  });

  return db;
}

const db = initDb();

// POST webhook
app.post('/webhooks/transactions', (req, res) => {
  const payload = req.body;
  console.log('Received webhook payload:', JSON.stringify(payload, null, 2));
  // Approve transaction when amount < 5000
  const approved = payload.amount < 5000;
  db.run(
    `INSERT OR REPLACE INTO transactions (id, card_id, amount, currency, approved) VALUES (?, ?, ?, ?, ?)`,
    [payload.id, payload.card_id, payload.amount, payload.currency, approved ? 1 : 0],
    function (err) {
      if (err) {
        console.error('DB insert error:', err);
        return res.status(500).json({ error: 'db_error' });
      }
      return res.json({ approved });
    }
  );
});

// GET transactions
app.get('/transactions', (req, res) => {
  db.all('SELECT id, card_id, amount, currency, approved FROM transactions ORDER BY rowid DESC', (err, rows) => {
    if (err) {
      console.error('DB select error:', err);
      return res.status(500).json({ error: 'db_error' });
    }
    const result = rows.map((r) => ({ ...r, approved: !!r.approved }));
    res.json(result);
  });
});

// POST to clear transactions (removes all transactions)
app.post('/transactions/clear', (req, res) => {
  db.run('DELETE FROM transactions', function (err) {
    if (err) {
      console.error('DB clear error:', err);
      return res.status(500).json({ error: 'db_error' });
    }
    console.log('Cleared transactions table');
    res.json({ cleared: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
