FROM debian:bullseye

# Install dependencies
RUN apt update && \
    apt install -y build-essential cmake ffmpeg curl git nodejs npm

# Set working directory
WORKDIR /app

# Clone whisper.cpp and build
RUN git clone https://github.com/ggerganov/whisper.cpp.git && \
    cd whisper.cpp && \
    make

# Download model (base.en)
RUN curl -L -o whisper.cpp/ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin

# Copy Node.js server
COPY server.js .

# Install express
RUN npm install express multer

# Expose port
EXPOSE 3000

CMD ["node", "server.js"]
