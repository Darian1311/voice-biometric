import http from "http";
import express from "express";
import { config } from "./config";
import telnyxWebhook from "./webhooks/telnyx";
import onboarding from "./routes/onboarding";
import { createStreamServer } from "./stream/handler";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(onboarding);
app.use(telnyxWebhook);

const server = http.createServer(app);
const wss = createStreamServer();

// Upgrade HTTP → WebSocket pentru /stream
server.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/stream")) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(config.port, () => {
  console.log(`[antiscam] server activ pe :${config.port}`);
  console.log(`[antiscam] webhook: POST ${config.webhookBaseUrl}/webhook/telnyx`);
  console.log(`[antiscam] stream: wss://${config.webhookBaseUrl.replace(/^https?:\/\//, "")}/stream`);
});
