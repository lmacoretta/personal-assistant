// Registers the bot's webhook with Telegram.
// Usage: npm run webhook:set -- https://<your-domain>/telegram/webhook
// See https://core.telegram.org/bots/api#setwebhook

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const url = process.argv[2];

if (!token || !secret) {
  console.error("Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET first.");
  process.exit(1);
}
if (!url?.startsWith("https://")) {
  console.error("Pass the public HTTPS webhook URL, e.g. https://example.com/telegram/webhook");
  process.exit(1);
}
// Telegram only accepts 1-256 chars of A-Z, a-z, 0-9, _ and -.
if (!/^[A-Za-z0-9_-]{1,256}$/.test(secret)) {
  console.error("TELEGRAM_WEBHOOK_SECRET may only contain A-Z, a-z, 0-9, _ and - (1-256 chars).");
  process.exit(1);
}

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url,
    secret_token: secret,
    allowed_updates: ["message"],
  }),
});

const result = await res.json();
console.log(result);
if (!result.ok) process.exit(1);
