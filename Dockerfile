FROM debian:bullseye

# Install dependencies and Node 18+
RUN apt-get update && \
    apt-get install -y build-essential cmake ffmpeg curl git && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Clone whisper.cpp and build it
RUN git clone https://github.com/ggerganov/whisper.cpp.git && \
    cd whisper.cpp && make

# Download model
RUN curl -L -o whisper.cpp/ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin

# Copy server file
COPY server.js .

# Install Node packages (express and multer)
RUN npm install express multer

# Expose port for Render
EXPOSE 3000

# Run server
CMD ["node", "server.js"]
