const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch"); // if Node < 18

const app = express();
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Health check
app.get("/", (req, res) => {
  res.send("Whisper.cpp transcription server is running.");
});

// --- Case 1: file upload ---
app.post("/transcribe", upload.single("audio"), (req, res) => {
  handleTranscription(req.file.path, res);
});

// --- Case 2: video/audio from URL ---
app.post("/transcribe-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).send("Missing URL");

    // Download file
    const tempFile = path.join(__dirname, "uploads", Date.now() + path.extname(url));
    const response = await fetch(url);
    const buffer = await response.buffer();
    fs.writeFileSync(tempFile, buffer);

    await handleTranscription(tempFile, res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed: " + err.message);
  }
});

// --- Helper: convert + transcribe ---
function handleTranscription(inputPath, res) {
  const wavPath = inputPath + ".wav";

  // Convert to WAV with ffmpeg
  exec(`ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}"`, (err) => {
    if (err) {
      cleanup(inputPath, wavPath);
      return res.status(500).send("Audio conversion failed: " + err.message);
    }

    // Run whisper.cpp
    exec(`./whisper.cpp/main -m ./whisper.cpp/ggml-base.en.bin -f "${wavPath}"`, (err, stdout, stderr) => {
      cleanup(inputPath, wavPath);
      if (err) return res.status(500).send("Transcription failed: " + stderr);

      res.send({ text: stdout.trim() });
    });
  });
}

// --- Clean up temp files ---
function cleanup(...files) {
  files.forEach((f) => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });
}

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
