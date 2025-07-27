const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/transcribe", upload.single("audio"), (req, res) => {
  const audioPath = path.join(__dirname, req.file.path);
  const wavPath = audioPath + ".wav";

  // Convert to WAV
  exec(`ffmpeg -i ${audioPath} -ar 16000 -ac 1 -c:a pcm_s16le ${wavPath}`, (err) => {
    if (err) return res.status(500).send("Audio conversion failed");

    // Run whisper.cpp
    exec(`./whisper.cpp/main -m ./whisper.cpp/ggml-base.en.bin -f ${wavPath}`, (err, stdout, stderr) => {
      if (err) return res.status(500).send("Transcription failed");

      res.send(`<pre>${stdout}</pre>`);
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
