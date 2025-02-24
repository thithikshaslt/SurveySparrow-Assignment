import { pipeline } from "@xenova/transformers";

console.log("✅ Worker script loaded. Attempting to load model inside worker...");

(async () => {
  try {
    const model = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en");
    console.log("✅ Whisper model loaded inside worker:", model);
  } catch (error) {
    console.error("❌ Error loading model inside worker:", error);
  }
})();
