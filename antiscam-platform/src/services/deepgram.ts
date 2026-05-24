import {
  createClient,
  LiveTranscriptionEvents,
  type LiveClient,
} from "@deepgram/sdk";
import { config } from "../config";

const dg = createClient(config.deepgramApiKey);

export interface DeepgramSession {
  send(audio: Buffer): void;
  close(): void;
}

export function createSTTSession(
  onTranscript: (text: string) => void,
  onError: (err: Error) => void
): DeepgramSession {
  let live: LiveClient;

  live = dg.listen.live({
    language: "ro",
    encoding: "mulaw",
    sample_rate: 8000,
    channels: 1,
    interim_results: false,
    punctuate: true,
    endpointing: 500,
  });

  live.on(LiveTranscriptionEvents.Open, () => {
    console.log("[deepgram] sesiune STT deschisă");
  });

  live.on(LiveTranscriptionEvents.Transcript, (data) => {
    const alt = data?.channel?.alternatives?.[0];
    const text: string = alt?.transcript ?? "";
    if (text.trim()) onTranscript(text.trim());
  });

  live.on(LiveTranscriptionEvents.Error, (err: Error) => {
    console.error("[deepgram] eroare:", err.message);
    onError(err);
  });

  live.on(LiveTranscriptionEvents.Close, () => {
    console.log("[deepgram] sesiune STT închisă");
  });

  return {
    send(audio: Buffer) {
      if (live.getReadyState() === 1 /* OPEN */) {
        // Native fetch / Deepgram SDK expects ArrayBuffer, not Node Buffer
        const ab = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength);
        live.send(ab as ArrayBuffer);
      }
    },
    close() {
      live.requestClose();
    },
  };
}
