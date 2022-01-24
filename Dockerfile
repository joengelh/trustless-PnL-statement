FROM ubuntu:latest

ARG DEBIAN_FRONTEND=noninteractive

RUN apt update

RUN apt install -y curl npm nodejs && \
    rm -rf /var/lib/apt/lists/* && \
    apt clean

RUN npm install --global yarn

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

# Add .cargo/bin to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

RUN rustup target add wasm32-unknown-unknown

ADD ./src/ /
COPY ./package.json /
ADD ./contract/ /

RUN yarn install
RUN yarn dev
