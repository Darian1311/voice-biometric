import express from "express";
import twilio from "twilio";
import { config } from "./config";
import incomingCall from "./routes/incomingCall";
import vapiAnalyze from "./routes/vapiAnalyze";

const app = express();

// Twilio posts application/x-www-form-urlencoded; VAPI posts JSON.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Validate X-Twilio-Signature on Twilio webhooks in production.
if (config.validateTwilio) {
  app.set("trust proxy", true);
  app.use(
    "/incoming-call",
    twilio.webhook({ validate: true }, config.twilioAuthToken)
  );
}

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(incomingCall);
app.use(vapiAnalyze);

app.listen(config.port, () => {
  console.log(`[twilio-gateway] ascultă pe :${config.port}`);
});
