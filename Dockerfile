FROM node:18-bullseye-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential cmake ffmpeg git curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Clone whisper.cpp and build it
RUN git clone --depth=1 https://github.com/ggerganov/whisper.cpp.git \
    && cd whisper.cpp && make

# Download model into models folder
RUN mkdir -p /app/whisper.cpp/models \
    && curl -L -o /app/whisper.cpp/models/ggml-base.en.bin \
       https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin

# Debug: confirm build + model
RUN ls -lh /app/whisper.cpp && ls -lh /app/whisper.cpp/models

# Copy package files and install dependencies
RUN npm install express multer node-fetch

# Copy server file
COPY server.js .

# Create uploads folder for temp files
RUN mkdir -p /app/uploads

# Set production mode
ENV NODE_ENV=production

# Expose port for Render
EXPOSE 3000

# Run server
CMD ["node", "server.js"]

