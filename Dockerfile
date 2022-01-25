# Latest Node v12 image
FROM node:12

# Update APT package manager
RUN apt update

# Install curl and remove unneccessary installation files
RUN apt install -y curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt clean

# Install Rust
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

# Add .cargo/bin to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Add wasm library to rust installation
RUN rustup target add wasm32-unknown-unknown

# Create working directory and copy app files
RUN mkdir -p /app
WORKDIR "/app"
ADD app /app

# Install required software
RUN yarn install

# Deploy contract and start webserver on port 1234
CMD ["yarn", "dev"]
