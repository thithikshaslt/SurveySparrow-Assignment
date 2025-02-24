import { pipeline } from "@xenova/transformers";

class MyTranscriptionPipeline {
  static task = "automatic-speech-recognition";
  static model = "openai/whisper-tiny.en";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, null, { progress_callback });
    }
    console.log("here")
    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  const { type, audio } = event.data;
  if (type === "TRANSCRIBE") {
    await transcribe(audio);
  }
});

async function transcribe(audio) {
  self.postMessage({ type: "LOADING", status: "loading" });

  let pipeline;
  try {
    pipeline = await MyTranscriptionPipeline.getInstance();
  } catch (err) {
    console.error(err);
    self.postMessage({ type: "ERROR", error: err.message });
    return;
  }

  self.postMessage({ type: "LOADING", status: "success" });

  try {
    const result = await pipeline(audio, {
      return_timestamps: true,
    });

    self.postMessage({ type: "TRANSCRIPTION_RESULT", transcription: result.text });
  } catch (err) {
    console.error(err);
    self.postMessage({ type: "ERROR", error: err.message });
  }
}
