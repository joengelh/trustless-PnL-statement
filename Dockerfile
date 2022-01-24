FROM node:12

RUN apt update

RUN apt install -y curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt clean

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

# Add .cargo/bin to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

RUN rustup target add wasm32-unknown-unknown


RUN mkdir -p /app
WORKDIR "/app"
ADD app /app

RUN ls -la /app/

RUN yarn install
CMD ["yarn", "dev"]
