FROM node:18-bullseye-slim

# Install dependencies
RUN apt-get update && apt-get install -y build-essential cmake ffmpeg git curl

# Set working directory
WORKDIR /app

# Clone whisper.cpp and build it
RUN git clone --depth=1 https://github.com/ggerganov/whisper.cpp.git && \
    cd whisper.cpp && make

# Download model
RUN curl -L -o whisper.cpp/ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin

# Copy package files and install node deps
RUN npm install express multer node-fetch

# Copy server file
COPY server.js .

# Set production mode
ENV NODE_ENV=production

# Expose port for Render
EXPOSE 3000

# Run server
CMD ["node", "server.js"]
