import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello railway!");
});

app.get("/marco", (c) => {
  return c.text("polo");
});

export default app;
