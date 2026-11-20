import { Hono } from "hono";
import { env } from "hono/adapter";
import { timingSafeEqual } from "hono/utils/buffer";

type TelegramEnv = {
  TELEGRAM_WEBHOOK_SECRET?: string;
};

// Only the fields the echo bot reads. See https://core.telegram.org/bots/api#update
type Update = {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
  };
};

const isUpdate = (body: unknown): body is Update =>
  typeof body === "object" &&
  body !== null &&
  typeof (body as Update).update_id === "number";

const telegram = new Hono();

telegram.post("/webhook", async (c) => {
  const { TELEGRAM_WEBHOOK_SECRET } = env<TelegramEnv>(c);
  if (!TELEGRAM_WEBHOOK_SECRET) {
    console.error("TELEGRAM_WEBHOOK_SECRET is not set");
    return c.json({ error: "Webhook not configured" }, 500);
  }

  // Telegram sends the secret_token given to setWebhook in this header.
  const secret = c.req.header("X-Telegram-Bot-Api-Secret-Token") ?? "";
  if (!(await timingSafeEqual(secret, TELEGRAM_WEBHOOK_SECRET))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json().catch(() => null);
  if (!isUpdate(body)) {
    return c.json({ error: "Invalid update" }, 400);
  }

  const message = body.message;
  if (!message) {
    // Other update types (edited messages, member changes, ...): acknowledge
    // with 200 so Telegram doesn't retry them.
    return c.body(null, 200);
  }

  // Answer in the webhook response itself: Telegram runs this method call,
  // so no outbound request (or bot token) is needed here. copyMessage echoes
  // any message type: text, photos, stickers, voice, documents...
  return c.json({
    method: "copyMessage",
    chat_id: message.chat.id,
    from_chat_id: message.chat.id,
    message_id: message.message_id,
  });
});

export default telegram;
