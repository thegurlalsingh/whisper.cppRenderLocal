const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("Whisper.cpp transcription server is running.");
});

app.post("/transcribe", upload.single("audio"), (req, res) => {
  const audioPath = path.join(__dirname, req.file.path);
  const wavPath = audioPath + ".wav";

  // Convert to WAV using ffmpeg
  exec(`ffmpeg -i ${audioPath} -ar 16000 -ac 1 -c:a pcm_s16le ${wavPath}`, (err) => {
    if (err) return res.status(500).send("Audio conversion failed: " + err.message);

    // Run whisper.cpp using the correct path
    exec(`./whisper.cpp/main -m ./whisper.cpp/ggml-base.en.bin -f ${wavPath}`, (err, stdout, stderr) => {
      if (err) return res.status(500).send("Transcription failed: " + stderr);

      // Clean up audio files
      fs.unlinkSync(audioPath);
      fs.unlinkSync(wavPath);

      res.send({ text: stdout.trim() });
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
