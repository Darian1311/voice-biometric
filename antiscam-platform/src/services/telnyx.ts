import { config } from "../config";

const BASE = "https://api.telnyx.com/v2";

async function telnyxPost(path: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.telnyxApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telnyx ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

export async function answerCall(callControlId: string): Promise<void> {
  await telnyxPost(`/calls/${callControlId}/actions/answer`, {});
}

export async function startStreaming(callControlId: string): Promise<void> {
  const streamUrl = `${config.webhookBaseUrl.replace(/^http/, "ws")}/stream`;
  await telnyxPost(`/calls/${callControlId}/actions/streaming_start`, {
    stream_url: streamUrl,
    stream_track: "inbound_track",  // audio from the scammer toward victim
    enable_dialogflow: false,
  });
}

// Dial out to victim. Returns new call_control_id for the outbound leg.
export async function dialVictim(
  fromNumber: string,   // callerId = scammer's number so victim sees it
  toNumber: string,     // victim's real phone
  clientState?: string  // base64 metadata passed back in webhook events
): Promise<string> {
  const data = await telnyxPost("/calls", {
    connection_id: config.telnyxConnectionId,
    from: fromNumber,
    to: toNumber,
    client_state: clientState
      ? Buffer.from(clientState).toString("base64")
      : undefined,
    timeout_secs: 30,
  }) as { data: { call_control_id: string } };
  return data.data.call_control_id;
}

// Bridge inbound call leg with outbound leg (victim answered).
export async function bridgeCalls(
  inboundCallControlId: string,
  outboundCallControlId: string
): Promise<void> {
  await telnyxPost(`/calls/${inboundCallControlId}/actions/bridge`, {
    call_control_id: outboundCallControlId,
  });
}

// Transfer inbound call to VAPI agent via SIP when scam confirmed.
export async function transferToVAPI(callControlId: string): Promise<void> {
  const sipUri = `sip:${config.vapiAssistantId}@${config.vapiSipDomain}`;
  await telnyxPost(`/calls/${callControlId}/actions/transfer`, {
    to: sipUri,
  });
}

export async function hangupCall(callControlId: string): Promise<void> {
  await telnyxPost(`/calls/${callControlId}/actions/hangup`, {});
}

// Send SMS with activation deep link. Victim taps link → dialer opens pre-filled → one tap "Sună".
export async function sendActivationSms(toPhone: string): Promise<void> {
  const ussd = encodeURIComponent(`*21*${config.telnyxNumber}#`);
  const link = `tel:${ussd}`;
  const text =
    `Apasa linkul de mai jos si apoi Suna pentru a activa protectia:\n${link}\n\nDureaza 3 secunde. - Veghe`;

  await telnyxPost("/messages", {
    from: config.telnyxNumber,
    to: toPhone,
    text,
  });
}
