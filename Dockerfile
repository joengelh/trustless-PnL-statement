FROM ubuntu:latest

ARG DEBIAN_FRONTEND=noninteractive

RUN apt update

RUN apt install -y node && \
    rm -rf /var/lib/apt/lists/* && \
    apt clean

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
RUN rustup target add wasm32-unknown-unknown

COPY .src/ /
COPY .package.json /
COPY .contract/ /

RUN yarn install
RUN yarn dev
