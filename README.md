# Webhook Transaction Demo

A demo that shows a Node.js + Express server receiving and processing a credit-card transaction webhook and storing results in SQLite. It has a minimal frontend (HTML + Tailwind CDN) that can send test webhooks and list stored transactions.

Key endpoints
- POST /webhooks/transactions — receive a webhook JSON payload and save the transaction (responds { approved: true|false }).
- GET /transactions — returns all saved transactions as JSON.
- POST /transactions/clear — removes all transactions (used by the demo UI).

Notes
- Amounts are treated as integer cents (e.g., 100 = $1.00). The server uses a transaction approval rule: approved when amount < 5000 (i.e., under $50).

Installation & quick start
1. Install dependencies:

```bash
cd webhook-transaction-demo
npm install
```

2. Start the server:

```bash
npm start
# then open http://localhost:3000
```

Dependencies: express, sqlite3

Recommended Node.js: Node 18+ (any modern Node.js LTS should work)